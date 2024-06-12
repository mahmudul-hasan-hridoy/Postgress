// app/api/auth/github/callback/route.js
import { NextResponse } from "next/server";
import fetch from "node-fetch";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import sendVerificationEmail from "@/lib/sendVerificationEmail";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) {
    return NextResponse.json(
      { error: "Code is missing from query parameters" },
      { status: 400 },
    );
  }

  const clientId = `${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}`;
  const clientSecret = `${process.env.GITHUB_CLIENT_SECRET}`;
  const tokenUrl = "https://github.com/login/oauth/access_token";
  const userUrl = "https://api.github.com/user";
  const emailUrl = "https://api.github.com/user/emails";

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });
    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      return NextResponse.json(
        { error: "Failed to retrieve access token" },
        { status: 400 },
      );
    }
    const accessToken = tokenData.access_token;

    // Fetch user data
    const userResponse = await fetch(userUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });
    const userData = await userResponse.json();

    // Fetch user emails
    const emailResponse = await fetch(emailUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });
    const emailData = await emailResponse.json();
    const primaryEmail = emailData.find((email) => email.primary).email;

    // Check if the user already exists
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
      primaryEmail,
    ]);
    if (rows.length > 0) {
      const existingUser = rows[0];
      if (existingUser.email_verified && existingUser.provider === "github") {
        // Generate JWT token for the existing user
        const token = jwt.sign(
          { id: existingUser.id },
          process.env.JWT_SECRET,
          { expiresIn: "7d" },
        );
        return NextResponse.json({ token });
      } else {
        return NextResponse.json({
          error: "Email already exists with a different provider",
        });
      }
    }

    // Generate a verification token
    const verificationToken = uuidv4();

    // Store new user data in the database
    const now = new Date();
    const { rows: newRows } = await pool.query(
      `INSERT INTO users (id,name, email, avatar_url, provider, verification_token, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7,$8)
       RETURNING id, name, email, avatar_url, provider, verification_token`,
      [
        uuidv4(),
        userData.name,
        primaryEmail,
        userData.avatar_url,
        "github",
        verificationToken,
        now,
        now,
      ],
    );
    const newUser = newRows[0];

    // Send verification email
    await sendVerificationEmail(newUser.email, verificationToken);
    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ error: "Internal Server Error" });
  }
}
