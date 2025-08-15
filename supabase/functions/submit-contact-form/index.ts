import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { UserConfirmationEmail } from './_templates/user-confirmation.tsx';
import { BusinessNotificationEmail } from './_templates/business-notification.tsx';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  lawFirm?: string;
  city?: string;
  state?: string;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Get client IP and user agent
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null;
    const userAgent = req.headers.get('user-agent') || null;

    console.log('Client IP:', clientIP);
    console.log('User Agent:', userAgent);

    // Parse and validate form data
    const formData: ContactFormData = await req.json();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Inserting contact submission into database...');
    console.log('Form data to insert:', {
      name: formData.name.trim(),
      email: formData.email.toLowerCase().trim(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
      law_firm: formData.lawFirm?.trim() || null,
      city: formData.city?.trim() || null,
      state: formData.state?.trim() || null,
      ip_address: clientIP,
      user_agent: userAgent,
    });

    // Store submission in database
    const { data: submission, error: dbError } = await supabase
      .from('contact_submissions')
      .insert({
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        law_firm: formData.lawFirm?.trim() || null,
        city: formData.city?.trim() || null,
        state: formData.state?.trim() || null,
        ip_address: clientIP,
        user_agent: userAgent,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error details:', dbError);
      console.error('Database error code:', dbError.code);
      console.error('Database error message:', dbError.message);
      return new Response(
        JSON.stringify({ error: "Failed to store submission", details: dbError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Submission stored successfully:', submission.id);

    // Start background tasks
    const backgroundTasks = Promise.all([
      sendEmails(formData, submission.id),
      syncToGoogleSheets(formData, submission.id),
    ]);

    // Don't await background tasks, but update status after they complete
    backgroundTasks.then(async ([emailSuccess, sheetsSuccess]) => {
      if (emailSuccess || sheetsSuccess) {
        await supabase
          .from('contact_submissions')
          .update({
            email_sent: emailSuccess,
            sheet_synced: sheetsSuccess,
          })
          .eq('id', submission.id);
      }
    }).catch(error => {
      console.error('Background task error:', error);
    });

    console.log('Contact form submission processed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Thank you for your message. We'll get back to you soon!",
        submissionId: submission.id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error("Error in submit-contact-form function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

async function sendEmails(formData: ContactFormData, submissionId: string): Promise<boolean> {
  try {
    console.log('Sending confirmation emails...');

    // Render email templates
    const userEmailHtml = await renderAsync(
      React.createElement(UserConfirmationEmail, {
        name: formData.name,
        subject: formData.subject,
      })
    );

    const businessEmailHtml = await renderAsync(
      React.createElement(BusinessNotificationEmail, {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        lawFirm: formData.lawFirm,
        city: formData.city,
        state: formData.state,
        submissionId,
      })
    );

    // Send user confirmation email
    const userEmailResponse = await resend.emails.send({
      from: "Amicus Edge <noreply@amicusedge.com>",
      to: [formData.email],
      subject: "Thank you for contacting Amicus Edge",
      html: userEmailHtml,
    });

    // Send business notification email
    const businessEmailResponse = await resend.emails.send({
      from: "Contact Form <contact@amicusedge.com>",
      to: ["info@amicusedge.com"], // Replace with your actual business email
      subject: `New Contact: ${formData.subject} - ${formData.name}`,
      html: businessEmailHtml,
    });

    console.log('User email sent:', userEmailResponse);
    console.log('Business email sent:', businessEmailResponse);

    return !userEmailResponse.error && !businessEmailResponse.error;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

async function syncToGoogleSheets(formData: ContactFormData, submissionId: string): Promise<boolean> {
  try {
    console.log('Syncing to Google Sheets...');

    const serviceAccount = JSON.parse(Deno.env.get("GOOGLE_SHEETS_SERVICE_ACCOUNT") ?? "{}");
    
    if (!serviceAccount.private_key) {
      console.error('Google Sheets service account not configured');
      return false;
    }

    // Create JWT token for Google Sheets API
    const header = {
      alg: "RS256",
      typ: "JWT",
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    };

    // Import crypto for JWT signing
    const encoder = new TextEncoder();
    const keyData = serviceAccount.private_key.replace(/\\n/g, '\n');
    const key = await crypto.subtle.importKey(
      "pkcs8",
      encoder.encode(keyData),
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
      },
      false,
      ["sign"]
    );

    const headerB64 = btoa(JSON.stringify(header)).replace(/[+/]/g, (c) => c === '+' ? '-' : '_').replace(/=/g, '');
    const payloadB64 = btoa(JSON.stringify(payload)).replace(/[+/]/g, (c) => c === '+' ? '-' : '_').replace(/=/g, '');
    const signatureData = encoder.encode(`${headerB64}.${payloadB64}`);
    
    const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, signatureData);
    const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/[+/]/g, (c) => c === '+' ? '-' : '_')
      .replace(/=/g, '');

    const jwt = `${headerB64}.${payloadB64}.${signatureB64}`;

    // Get access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      console.error('Failed to get Google access token:', tokenData);
      return false;
    }

    // Prepare row data for Google Sheets - matching your column order:
    // Name, Email, Law Firm, Subject, City, State, Message
    const rowData = [
      formData.name,
      formData.email,
      formData.lawFirm || '',
      formData.subject,
      formData.city || '',
      formData.state || '',
      formData.message,
    ];

    // Get the Sheet ID from environment variable
    const SHEET_ID = Deno.env.get("GOOGLE_SHEET_ID");
    
    if (!SHEET_ID) {
      console.error('Google Sheet ID not configured');
      return false;
    }
    const sheetsResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1:append?valueInputOption=RAW`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: [rowData],
        }),
      }
    );

    const sheetsResult = await sheetsResponse.json();
    console.log('Google Sheets sync result:', sheetsResult);

    return sheetsResponse.ok;
  } catch (error) {
    console.error('Google Sheets sync error:', error);
    return false;
  }
}

serve(handler);