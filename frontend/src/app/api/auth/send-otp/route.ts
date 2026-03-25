import { NextResponse } from "next/server";
import twilio from "twilio";

// Ensure these exist in your .env.local file.
// You can get them by creating a free Twilio account and setting up a Verify service!
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

// We initialize twilio only if we have credentials
const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    if (!client || !verifyServiceSid) {
      return NextResponse.json({ 
        error: "Twilio credentials are not set up in .env.local. Check TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID." 
      }, { status: 500 });
    }

    // Send the Verification code using Twilio Verify API
    const verification = await client.verify.v2.services(verifyServiceSid)
      .verifications.create({ to: phone, channel: "sms" });

    return NextResponse.json({ success: true, status: verification.status });
    
  } catch (error: unknown) {
    console.error("Twilio Send Error:", error);
    const msg = error instanceof Error ? error.message : "Failed to send 2FA OTP.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
