// api/auth/gooogle/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import crypto from "crypto";
import pool from "@/lib/db";
import sendEmail from "@/lib/sendEmail";
import jwt from "jsonwebtoken";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.SITE_URL}/api/auth/google/callback`,
);

function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function sendVerificationEmail(name, email, verificationToken) {
  const verificationLink = `${process.env.SITE_URL}/api/auth/verify?token=${verificationToken}`;
  const emailSubject = "Verify your email address";
  const emailHtml = `
    <p>Dear ${name}</p>
    <p>Thank you for registering with our service. To complete your registration, please verify your email address by clicking the link below:</p>
    <p><a href="${verificationLink}">Verify Your Email</a></p>
    <p>If you did not create an account, no further action is required.</p>
    <p>Best regards,</p>
    <p>The Vercel Team</p>
  `;

  try {
    await sendEmail({ to: email, subject: emailSubject, html: emailHtml });
    console.log("Verification email sent successfully");
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
}

export const GET = async (request: NextRequest) => {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(
      `${process.env.SITE_URL}/auth/register?error=missingCode`,
    );
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    const userinfo = await google.oauth2("v2").userinfo.get({
      auth: oauth2Client,
    });
    const { email, name, picture } = userinfo.data;

    // Check if the user already exists in the database
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (existingUser.rowCount > 0) {
      // User already exists, log them in
      console.log("User logged in:", existingUser.rows[0]);
      const token = jwt.sign(
        { userId: existingUser.rows[0].id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );
      // Set token as cookie
      const response = NextResponse.redirect(
        `${process.env.SITE_URL}/dashboard`,
      );
      response.cookies.set("token", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60,
      });
      return response;
    } else {
      // Create a new user
      const verificationToken = generateVerificationToken();
      const userData = {
        email,
        name: name,
        avatarUrl: picture,
        verificationToken,
      };

      const { rows } = await pool.query(
        "INSERT INTO users (email, name, avatar_url, verification_token) VALUES ($1, $2, $3, $4) RETURNING id",
        [
          userData.email,
          userData.name,
          userData.avatarUrl,
          userData.verificationToken,
        ],
      );

      const userId = rows[0].id;
      console.log("User signed up successfully:", userId);

      // Generate JWT token for the new user
      const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      // Send verification email
      await sendVerificationEmail(
        userData.name,
        userData.email,
        userData.verificationToken,
      );

      // Set token as cookie
      const response = NextResponse.redirect(
        `${process.env.SITE_URL}/auth/register?success=signedUpWithGoogle`,
      );
      response.cookies.set("token", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60,
      });
      return response;
    }
  } catch (error) {
    console.error("Error signing up with Google:", error);
    return NextResponse.redirect(
      `${process.env.SITE_URL}/auth/register?error=signUpFailed`,
    );
  }
};
