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
    // Parse x-forwarded-for header to get only the first IP address
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIP = forwardedFor 
      ? forwardedFor.split(',')[0].trim() 
      : req.headers.get('x-real-ip') || null;
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

    // Start background tasks using EdgeRuntime.waitUntil
    console.log('Starting background tasks...');
    
    const backgroundTasks = async () => {
      try {
        console.log('Running email and sheets sync in background...');
        const [emailSuccess, sheetsSuccess] = await Promise.all([
          sendEmails(formData, submission.id),
          syncToGoogleSheets(formData, submission.id),
        ]);

        console.log('Background tasks completed:', { emailSuccess, sheetsSuccess });

        // Update the submission record with results
        await supabase
          .from('contact_submissions')
          .update({
            email_sent: emailSuccess,
            sheet_synced: sheetsSuccess,
          })
          .eq('id', submission.id);

        console.log('Background task status updated in database');
      } catch (error) {
        console.error('Background task error:', error);
        // Update with failure status
        await supabase
          .from('contact_submissions')
          .update({
            email_sent: false,
            sheet_synced: false,
          })
          .eq('id', submission.id);
      }
    };

    // Use EdgeRuntime.waitUntil to ensure background tasks complete
    if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
      console.log('Using EdgeRuntime.waitUntil for background tasks');
      EdgeRuntime.waitUntil(backgroundTasks());
    } else {
      console.log('EdgeRuntime not available, running background tasks without waiting');
      // Run without waiting if EdgeRuntime is not available
      backgroundTasks().catch(console.error);
    }

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
      from: "Amicus Edge <onboarding@resend.dev>",
      to: [formData.email],
      subject: "Thank you for contacting Amicus Edge",
      html: userEmailHtml,
    });

    // Send business notification email
    const businessEmailResponse = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>",
      to: ["joe@bizooma.com"], // Business notification email
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

    const serviceAccountJson = Deno.env.get("GOOGLE_SHEETS_SERVICE_ACCOUNT");
    if (!serviceAccountJson) {
      console.error('GOOGLE_SHEETS_SERVICE_ACCOUNT environment variable not set');
      return false;
    }

    console.log('Service account JSON raw length:', serviceAccountJson.length);
    console.log('Service account JSON first 100 chars:', serviceAccountJson.substring(0, 100));
    console.log('Service account JSON last 100 chars:', serviceAccountJson.substring(serviceAccountJson.length - 100));

    // Check if the JSON is wrapped in extra quotes
    let jsonToParse = serviceAccountJson;
    if (serviceAccountJson.startsWith('"') && serviceAccountJson.endsWith('"')) {
      console.log('Detected JSON wrapped in quotes, unwrapping...');
      jsonToParse = serviceAccountJson.slice(1, -1);
      // Also handle escaped quotes within
      jsonToParse = jsonToParse.replace(/\\"/g, '"');
    }

    console.log('Parsing service account JSON...');
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(jsonToParse);
      console.log('JSON parsed successfully');
      console.log('Service account keys:', Object.keys(serviceAccount));
      console.log('Has private_key:', !!serviceAccount.private_key);
      console.log('Has client_email:', !!serviceAccount.client_email);
    } catch (error) {
      console.error('Failed to parse service account JSON:', error);
      console.error('JSON to parse length:', jsonToParse.length);
      console.error('JSON to parse sample:', jsonToParse.substring(0, 200));
      return false;
    }
    
    if (!serviceAccount.private_key) {
      console.error('Google Sheets service account private_key not found');
      console.error('Available keys in service account:', Object.keys(serviceAccount));
      return false;
    }

    console.log('Service account client_email:', serviceAccount.client_email);
    console.log('Private key starts with:', serviceAccount.private_key.substring(0, 50));
    console.log('Private key ends with:', serviceAccount.private_key.substring(serviceAccount.private_key.length - 50));

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

    // Process the private key - handle different formats
    console.log('Processing private key...');
    let keyData = serviceAccount.private_key;
    
    // Handle escaped newlines
    if (keyData.includes('\\n')) {
      keyData = keyData.replace(/\\n/g, '\n');
    }
    
    // Ensure proper PEM format
    if (!keyData.startsWith('-----BEGIN PRIVATE KEY-----')) {
      console.error('Private key is not in proper PEM format');
      return false;
    }
    
    // Extract the base64 content between the PEM headers
    const pemContent = keyData
      .replace('-----BEGIN PRIVATE KEY-----', '')
      .replace('-----END PRIVATE KEY-----', '')
      .replace(/\s/g, '');
    
    console.log('Attempting to decode base64 private key...');
    let keyBuffer;
    try {
      keyBuffer = Uint8Array.from(atob(pemContent), c => c.charCodeAt(0));
    } catch (error) {
      console.error('Failed to decode base64 private key:', error);
      return false;
    }

    console.log('Importing private key for crypto operations...');
    let key;
    try {
      key = await crypto.subtle.importKey(
        "pkcs8",
        keyBuffer,
        {
          name: "RSASSA-PKCS1-v1_5",
          hash: "SHA-256",
        },
        false,
        ["sign"]
      );
    } catch (error) {
      console.error('Failed to import private key:', error);
      return false;
    }

    console.log('Creating JWT signature...');
    const encoder = new TextEncoder();
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