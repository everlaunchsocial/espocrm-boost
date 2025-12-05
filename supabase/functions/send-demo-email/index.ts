import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendDemoEmailRequest {
  demoId: string;
  toEmail: string;
  toName?: string;
  fromName?: string;
  baseUrl?: string; // Optional override for demo base URL
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { demoId, toEmail, toName, fromName, baseUrl }: SendDemoEmailRequest = await req.json();

    console.log("Send demo email request:", { demoId, toEmail, toName, fromName });

    // Validate required fields
    if (!demoId) {
      return new Response(
        JSON.stringify({ success: false, error: "demoId is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!toEmail) {
      return new Response(
        JSON.stringify({ success: false, error: "toEmail is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Load demo from database
    const { data: demo, error: demoError } = await supabase
      .from("demos")
      .select("*")
      .eq("id", demoId)
      .single();

    if (demoError || !demo) {
      console.error("Demo not found:", demoError);
      return new Response(
        JSON.stringify({ success: false, error: "Demo not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Found demo:", { id: demo.id, business_name: demo.business_name, status: demo.status });

    // Build demo URL
    // Priority: 1) baseUrl from request, 2) PUBLIC_DEMO_BASE_URL env, 3) derive from Supabase URL
    const publicBaseUrl = baseUrl || Deno.env.get("PUBLIC_DEMO_BASE_URL") || `https://${supabaseUrl.replace('https://', '').replace('.supabase.co', '')}.lovable.app`;
    const demoUrl = `${publicBaseUrl.replace(/\/$/, '')}/demo/${demoId}`;

    console.log("Demo URL:", demoUrl);

    // Build email content
    const senderName = fromName || "EverLaunch";
    const recipientName = toName || "there";
    const businessName = demo.business_name;

    const emailSubject = `Your personalized AI receptionist demo is ready`;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your AI Demo is Ready</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
                ✨ EverLaunch
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">
                AI-Powered Customer Engagement
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">
                Hi ${recipientName},
              </h2>
              
              <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                We've built a personalized AI demo specifically for <strong>${businessName}</strong>. 
                This demo shows exactly how an AI voice and chat assistant could work on your website — 
                answering customer questions, capturing leads, and booking appointments 24/7.
              </p>
              
              <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                Click below to experience your custom AI assistant:
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${demoUrl}" 
                       style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
                      View Your AI Demo →
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #71717a; font-size: 14px; line-height: 1.6; margin: 32px 0 0 0;">
                In your demo, you can:
              </p>
              <ul style="color: #52525b; font-size: 14px; line-height: 1.8; margin: 8px 0 0 0; padding-left: 20px;">
                <li>Talk to an AI voice assistant trained on your business</li>
                <li>See how it would handle customer inquiries</li>
                <li>Experience 24/7 lead capture in action</li>
              </ul>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb;">
              <p style="color: #71717a; font-size: 13px; margin: 0; text-align: center;">
                Questions? Reply to this email or contact us anytime.
              </p>
              <p style="color: #a1a1aa; font-size: 12px; margin: 12px 0 0 0; text-align: center;">
                Powered by EverLaunch • AI that works while you sleep
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: `${senderName} <info@everlaunch.ai>`,
      to: toName ? [`${toName} <${toEmail}>`] : [toEmail],
      subject: emailSubject,
      html: emailHtml,
    });

    console.log("Resend response:", emailResponse);

    if (emailResponse.error) {
      console.error("Resend error:", emailResponse.error);
      return new Response(
        JSON.stringify({ success: false, error: emailResponse.error.message }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update demo record
    const updateData: Record<string, unknown> = {
      email_sent_at: new Date().toISOString(),
    };

    // Only update status to 'sent' if currently 'draft'
    if (demo.status === 'draft') {
      updateData.status = 'sent';
    }

    const { data: updatedDemo, error: updateError } = await supabase
      .from("demos")
      .update(updateData)
      .eq("id", demoId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating demo:", updateError);
      // Email was sent successfully, so we don't fail the request
      // but log the error
    }

    const finalStatus = updatedDemo?.status || demo.status;

    console.log("Demo email sent successfully:", {
      demoId,
      demoUrl,
      status: finalStatus,
      emailId: emailResponse.data?.id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        demoId: demoId,
        demoUrl: demoUrl,
        status: finalStatus,
        emailId: emailResponse.data?.id,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-demo-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
