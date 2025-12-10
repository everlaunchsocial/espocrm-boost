import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Admin: List all phone numbers
  app.get("/api/admin/phone-numbers", async (_req: Request, res: Response) => {
    try {
      const phones = await storage.getAllPhoneNumbers();
      return res.json(phones);
    } catch (error) {
      console.error("Error fetching phone numbers:", error);
      return res.status(500).json({ error: "Failed to fetch phone numbers" });
    }
  });

  // Phone Provisioning Route
  app.post("/api/provision-phone", async (req: Request, res: Response) => {
    try {
      const { customerId, areaCode } = req.body;

      if (!customerId) {
        return res.status(400).json({ success: false, error: "customerId is required" });
      }

      console.log(`Provisioning phone for customer: ${customerId}, area code: ${areaCode || "any"}`);

      // Check if customer already has a phone number
      const existingPhone = await storage.getCustomerPhoneNumber(customerId);
      if (existingPhone) {
        console.log("Customer already has phone number:", existingPhone.phoneNumber);
        return res.json({
          success: true,
          phoneNumber: existingPhone.phoneNumber,
          message: "Phone number already provisioned"
        });
      }

      // Fetch customer data for assistant configuration
      const customerProfile = await storage.getCustomerProfile(customerId);
      if (!customerProfile) {
        return res.status(404).json({ success: false, error: "Customer not found" });
      }

      // Fetch voice and chat settings
      const voiceSettingsData = await storage.getVoiceSettings(customerId);
      const chatSettingsData = await storage.getChatSettings(customerId);

      // Get Vapi API key from secrets (primary) or fall back to vapi_accounts table
      let vapiApiKey = process.env.VAPI_API_KEY;
      let vapiAccount: { id: string; name: string; numbersProvisioned: number; maxNumbers: number } | null = null;

      if (vapiApiKey) {
        // Use secret key - find or create a "Primary" account record for tracking
        const primaryAccount = await storage.getVapiAccountByName("Primary Vapi Account");

        if (primaryAccount) {
          vapiAccount = primaryAccount;
          console.log(`Using Primary Vapi Account from secrets (${primaryAccount.numbersProvisioned}/${primaryAccount.maxNumbers})`);
        } else {
          // Create tracking record for the secret-based account
          const newAccount = await storage.createVapiAccount({
            name: "Primary Vapi Account",
            apiKey: "STORED_IN_SECRETS",
            maxNumbers: 10,
            isActive: true,
          });
          vapiAccount = newAccount;
          console.log("Created Primary Vapi Account tracking record");
        }
      } else {
        // Fall back to vapi_accounts table for multi-account rotation
        const account = await storage.getAvailableVapiAccount();

        if (!account) {
          console.error("No available Vapi account");
          return res.status(503).json({ 
            success: false, 
            error: "No available phone number capacity. Please contact support." 
          });
        }

        vapiAccount = account;
        vapiApiKey = account.apiKey;
        console.log(`Using Vapi account: ${account.name} (${account.numbersProvisioned}/${account.maxNumbers})`);
      }

      if (!vapiApiKey || !vapiAccount) {
        return res.status(503).json({ 
          success: false, 
          error: "Vapi API key not configured. Please contact support." 
        });
      }

      // Build assistant system prompt
      const businessName = customerProfile.businessName || "our company";
      const greeting = voiceSettingsData?.greetingText || chatSettingsData?.greetingText ||
        `Hello! Thank you for calling ${businessName}. How can I help you today?`;

      const tone = chatSettingsData?.tone || "professional";
      const voiceGender = voiceSettingsData?.voiceGender || "female";
      const voiceStyle = voiceSettingsData?.voiceStyle || "friendly";

      const systemPrompt = `You are ${businessName}'s AI phone assistant. Your tone is ${tone} and ${voiceStyle}.

Your greeting: "${greeting}"

Guidelines:
- Be helpful, concise, and professional
- If asked about services, describe what ${businessName} offers based on available information
- For appointments or urgent matters, offer to collect contact information
- If you don't know something, say you'll have a team member follow up

Business: ${businessName}
${customerProfile.websiteUrl ? `Website: ${customerProfile.websiteUrl}` : ""}
${customerProfile.businessType ? `Industry: ${customerProfile.businessType}` : ""}`;

      // Step 1: Create Vapi Assistant
      console.log("Creating Vapi assistant...");
      const assistantResponse = await fetch("https://api.vapi.ai/assistant", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${vapiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${businessName} AI Assistant`,
          model: {
            provider: "openai",
            model: "gpt-4o-mini",
            systemPrompt: systemPrompt,
          },
          voice: {
            provider: "openai",
            voiceId: voiceGender === "male" ? "alloy" : "nova",
          },
          firstMessage: greeting,
          endCallMessage: "Thank you for calling! Have a great day!",
          recordingEnabled: true,
          silenceTimeoutSeconds: 30,
          maxDurationSeconds: 600,
        }),
      });

      if (!assistantResponse.ok) {
        const errorText = await assistantResponse.text();
        console.error("Vapi assistant creation failed:", errorText);
        return res.status(500).json({ 
          success: false, 
          error: `Failed to create AI assistant: ${errorText}` 
        });
      }

      const assistant = await assistantResponse.json();
      console.log("Created assistant:", assistant.id);

      // Step 2: Purchase phone number
      console.log("Purchasing phone number...");
      const phoneBody: Record<string, unknown> = {
        provider: "vapi",
        assistantId: assistant.id,
      };

      if (areaCode && areaCode.length === 3) {
        phoneBody.numberDesiredAreaCode = areaCode;
      }

      const phoneResponse = await fetch("https://api.vapi.ai/phone-number", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${vapiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(phoneBody),
      });

      if (!phoneResponse.ok) {
        const errorText = await phoneResponse.text();
        console.error("Phone purchase failed:", errorText);

        // Try to delete the assistant we just created
        await fetch(`https://api.vapi.ai/assistant/${assistant.id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${vapiApiKey}` },
        });

        return res.status(500).json({ 
          success: false, 
          error: `Failed to purchase phone number: ${errorText}` 
        });
      }

      const phoneData = await phoneResponse.json();
      console.log("Purchased phone number:", phoneData.number);

      // Step 3: Save to database
      await storage.createCustomerPhoneNumber({
        customerId: customerId,
        vapiAccountId: vapiAccount.id,
        phoneNumber: phoneData.number,
        vapiPhoneId: phoneData.id,
        vapiAssistantId: assistant.id,
        areaCode: areaCode || phoneData.number?.substring(2, 5) || null,
        status: "active",
      });

      // Step 4: Increment numbers_provisioned on vapi_account
      await storage.incrementVapiAccountNumbers(vapiAccount.id);

      console.log(`Successfully provisioned ${phoneData.number} for customer ${customerId}`);

      return res.json({
        success: true,
        phoneNumber: phoneData.number,
        assistantId: assistant.id,
        message: "Phone number provisioned successfully"
      });

    } catch (error) {
      console.error("Provisioning error:", error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Release Phone Number Route
  app.post("/api/release-phone", async (req: Request, res: Response) => {
    try {
      const { customerId } = req.body;

      if (!customerId) {
        return res.status(400).json({ success: false, error: "customerId is required" });
      }

      console.log(`Releasing phone for customer: ${customerId}`);

      // Get the phone record
      const phoneRecord = await storage.getCustomerPhoneNumber(customerId);
      if (!phoneRecord) {
        return res.status(404).json({ success: false, error: "No phone number found for this customer" });
      }

      // Get Vapi API key
      const vapiApiKey = process.env.VAPI_API_KEY;
      if (!vapiApiKey) {
        return res.status(503).json({ success: false, error: "Vapi API key not configured" });
      }

      // Step 1: Delete the phone number from Vapi
      if (phoneRecord.vapiPhoneId) {
        console.log(`Deleting Vapi phone: ${phoneRecord.vapiPhoneId}`);
        const phoneDeleteResponse = await fetch(`https://api.vapi.ai/phone-number/${phoneRecord.vapiPhoneId}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${vapiApiKey}` },
        });

        if (!phoneDeleteResponse.ok) {
          const errorText = await phoneDeleteResponse.text();
          console.error("Failed to delete phone from Vapi:", errorText);
        } else {
          console.log("Phone number deleted from Vapi");
        }
      }

      // Step 2: Delete the assistant from Vapi
      if (phoneRecord.vapiAssistantId) {
        console.log(`Deleting Vapi assistant: ${phoneRecord.vapiAssistantId}`);
        const assistantDeleteResponse = await fetch(`https://api.vapi.ai/assistant/${phoneRecord.vapiAssistantId}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${vapiApiKey}` },
        });

        if (!assistantDeleteResponse.ok) {
          const errorText = await assistantDeleteResponse.text();
          console.error("Failed to delete assistant from Vapi:", errorText);
        } else {
          console.log("Assistant deleted from Vapi");
        }
      }

      // Step 3: Decrement the vapi account counter
      await storage.decrementVapiAccountNumbers(phoneRecord.vapiAccountId);

      // Step 4: Delete from database
      await storage.deleteCustomerPhoneNumber(customerId);

      console.log(`Successfully released ${phoneRecord.phoneNumber} for customer ${customerId}`);

      return res.json({
        success: true,
        releasedNumber: phoneRecord.phoneNumber,
        message: "Phone number released successfully"
      });

    } catch (error) {
      console.error("Release error:", error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
