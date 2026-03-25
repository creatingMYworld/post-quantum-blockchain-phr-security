import { NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function POST(req: Request) {
  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return NextResponse.json({ error: "Phone and verification code are required" }, { status: 400 });
    }

    if (!client || !verifyServiceSid) {
      return NextResponse.json({ 
        error: "Twilio credentials missing. Local test fallback active.",
        status: "approved" // Mocking fallback for dev if they don't have keys yet.
      });
    }

    // Verify the code with Twilio
    const verificationCheck = await client.verify.v2.services(verifyServiceSid)
      .verificationChecks.create({ to: phone, code: code });

    if (verificationCheck.status === "approved") {
      return NextResponse.json({ success: true, status: "approved" });
    } else {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Twilio Verify Error:", error);
    return NextResponse.json({ error: error.message || "Failed to verify 2FA OTP." }, { status: 500 });
  }
}
