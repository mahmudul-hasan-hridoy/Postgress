// app/api/auth/check-email/route.js
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import sendEmail from "@/lib/sendEmail";
import crypto from "crypto";

function generate6DigitToken() {
  return crypto.randomBytes(3).toString("hex").slice(0, 6);
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

      // Generate and store verification code
      const verificationCode = generate6DigitToken();
      if (userExists) {
        await client.query(
          "UPDATE users SET verification_code = $1 WHERE email = $2",
          [verificationCode, email],
        );
      } else {
        // Store the email and verification code for potential new users
        await client.query(
          "INSERT INTO pending_users (email, verification_code) VALUES ($1, $2)",
          [email, verificationCode],
        );
      }

      // Send verification email
      await sendEmail({
        to: email,
        subject: "Your Verification Code",
        html: `Your verification code is: ${verificationCode}`,
      });

      return NextResponse.json({
        message: "Verification code sent",
        exists: userExists,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in check-email:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
