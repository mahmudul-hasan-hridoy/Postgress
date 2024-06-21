// app/api/auth/check-email/route.js
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import sendEmail from "@/lib/sendEmail";
import crypto from "crypto";

// Function to generate a 6-digit token
function generate6DigitToken() {
  const buffer = crypto.randomBytes(3);
  const token = buffer.toString("hex").slice(0, 6);
  return token;
}

export async function POST(req) {
  try {
    const { email } = await req.json();

    const client = await pool.connect();
    try {
      // Check if the email exists
      const result = await client.query(
        "SELECT * FROM users WHERE email = $1",
        [email],
      );
      const userExists = result.rows.length > 0;

      if (userExists) {
        // Generate and store verification code
        const verificationCode = generate6DigitToken();
        await client.query(
          "UPDATE users SET verification_code = $1 WHERE email = $2",
          [verificationCode, email],
        );

        // Send verification email
        await sendEmail({
          to: email,
          subject: "Your Verification Code",
          html: `Your verification code is: ${verificationCode}`,
        });

        return NextResponse.json({
          exists: true,
          message: "Verification code sent",
        });
      } else {
        return NextResponse.json({ exists: false, message: "New user" });
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in check-email:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
