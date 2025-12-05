import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const { businessInfo } = await req.json();

    // Build dynamic system prompt based on business info
    let systemPrompt = "You are a friendly, professional AI receptionist. ";
    
    if (businessInfo?.businessName) {
      systemPrompt += `You work for ${businessInfo.businessName}. `;
    }

    if (businessInfo?.services && businessInfo.services.length > 0) {
      systemPrompt += `The business specializes in ${businessInfo.services.join(', ')}. `;
    }

    if (businessInfo?.description) {
      systemPrompt += `About the business: ${businessInfo.description.substring(0, 200)}. `;
    }

    // Add business hours if available
    if (businessInfo?.hours) {
      systemPrompt += `Business hours: ${businessInfo.hours}. `;
    }

    // Add contact info
    if (businessInfo?.phones?.length > 0) {
      systemPrompt += `Phone: ${businessInfo.phones[0]}. `;
    }
    if (businessInfo?.emails?.length > 0) {
      systemPrompt += `Email: ${businessInfo.emails[0]}. `;
    }
    if (businessInfo?.address) {
      systemPrompt += `Address: ${businessInfo.address}. `;
    }

    systemPrompt += `
Your job is to:
- Greet callers warmly and professionally
- Answer questions about the business and services
- Help schedule appointments or take messages
- Provide basic information like hours and location when asked
- Be helpful, friendly, and conversational
- Keep responses concise and natural for voice conversation

IMPORTANT - You have tools available to help callers:
- When someone asks for information to be sent to them (email with hours, services, etc.), use the send_email tool
- When someone wants a callback, use the schedule_callback tool to log their request
- When asked about business hours, you can answer directly from your knowledge OR use get_business_info for accurate details

If you don't know specific details, politely say you'd be happy to have someone call them back with that information, and offer to schedule a callback.
`;

    console.log('Creating realtime session with tools...');

    // Define tools for the AI to use
    const tools = [
      {
        type: "function",
        name: "send_email",
        description: "Send an email to the caller with requested information like business hours, services, pricing, or any other details they asked for. Use this when someone says 'send me an email' or 'can you email me that information'.",
        parameters: {
          type: "object",
          properties: {
            recipient_email: {
              type: "string",
              description: "The email address to send to. Ask the caller for their email if not provided."
            },
            subject: {
              type: "string",
              description: "The email subject line"
            },
            content: {
              type: "string",
              description: "The email body content - include all the information the caller requested"
            },
            caller_name: {
              type: "string",
              description: "The caller's name if they provided it"
            }
          },
          required: ["recipient_email", "subject", "content"]
        }
      },
      {
        type: "function",
        name: "schedule_callback",
        description: "Schedule a callback request when someone wants the business to call them back. Use this when someone says 'have someone call me' or 'I'd like a callback'.",
        parameters: {
          type: "object",
          properties: {
            caller_name: {
              type: "string",
              description: "The caller's name"
            },
            phone_number: {
              type: "string",
              description: "The phone number to call back"
            },
            preferred_time: {
              type: "string",
              description: "When they'd like to be called back (e.g., 'tomorrow morning', 'after 3pm')"
            },
            reason: {
              type: "string",
              description: "What they want to discuss"
            }
          },
          required: ["caller_name", "phone_number"]
        }
      },
      {
        type: "function",
        name: "get_business_info",
        description: "Get accurate business information like hours, address, services. Use this to provide accurate details to callers.",
        parameters: {
          type: "object",
          properties: {
            info_type: {
              type: "string",
              enum: ["hours", "address", "services", "contact", "all"],
              description: "What type of information to retrieve"
            }
          },
          required: ["info_type"]
        }
      }
    ];

    // Request an ephemeral token from OpenAI with tools configured
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "alloy",
        instructions: systemPrompt,
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        input_audio_transcription: {
          model: "whisper-1"
        },
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 800
        },
        tools: tools,
        tool_choice: "auto"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Realtime session created with tools");

    // Include business info in response so frontend can use it for tool execution
    return new Response(JSON.stringify({
      ...data,
      businessInfo: businessInfo
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error creating realtime session:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
