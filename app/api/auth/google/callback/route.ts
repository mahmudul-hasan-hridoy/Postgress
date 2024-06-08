import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import crypto from "crypto";
import pool from "@/lib/db";
import sendEmail from "@/lib/sendEmail";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.SITE_URL}/api/auth/google/callback`,
);

function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function sendVerificationEmail(email, verificationToken) {
  const verificationLink = `${process.env.SITE_URL}/verify?token=${verificationToken}`;
  const emailSubject = "Verify your email address";
  const emailHtml = `
    <p>Hello,</p>
    <p>Please click the following link to verify your email address:</p>
    <a href="${verificationLink}">${verificationLink}</a>
    <p>If you didn't sign up for our service, you can ignore this email.</p>
  `;

  try {
    await sendEmail({ to: email, subject: emailSubject, html: emailHtml });
    console.log("Verification email sent successfully");
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.error();
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
      "SELECT * FROM google_users WHERE email = $1",
      [email],
    );

    if (existingUser.rowCount > 0) {
      // User already exists, log them in
      console.log("User logged in:", existingUser.rows[0]);
      // Perform login logic here
    } else {
      // Create a new user
      const verificationToken = generateVerificationToken();
      const userData = {
        email,
        username: name,
        avatarUrl: picture,
        verificationToken,
      };

      const { rows } = await pool.query(
        "INSERT INTO google_users (email, username, avatar_url, verification_token) VALUES ($1, $2, $3, $4) RETURNING id",
        [
          userData.email,
          userData.username,
          userData.avatarUrl,
          userData.verificationToken,
        ],
      );

      const userId = rows[0].id;
      console.log("User signed up successfully:", userId);

      // Send verification email
      await sendVerificationEmail(userData.email, userData.verificationToken);
    }
  } catch (error) {
    console.error("Error signing up with Google:", error);
    // Handle error cases
  }

  return NextResponse.redirect(`${process.env.SITE_URL}/auth/login`);
}