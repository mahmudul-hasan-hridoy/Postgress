// app/api/auth/github/callback/route.js
import { NextResponse } from "next/server";
import fetch from "node-fetch";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

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

    let user;
    let isNewUser = false;

    if (rows.length > 0) {
      user = rows[0];
      if (user.provider !== "github") {
        const redirectUrl = new URL("/auth/register", process.env.NEXT_PUBLIC_BASE_URL);
        redirectUrl.searchParams.set("exist", "Email already exists with a different provider");
        return NextResponse.redirect(redirectUrl.toString());
      }
    } else {
      isNewUser = true;
      // Generate a verification token
      const verificationToken = uuidv4();

      // Store new user data in the database
      const now = new Date();
      const { rows: newRows } = await pool.query(
        `INSERT INTO users (id, name, email, avatar_url, provider, verification_token, email_verified, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, name, email, avatar_url, provider, verification_token, email_verified`,
        [
          uuidv4(),
          userData.name,
          primaryEmail,
          userData.avatar_url,
          "github",
          verificationToken,
          true,
          now,
          now,
        ],
      );
      user = newRows[0];
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatar_url,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // Redirect to the appropriate frontend page with the token
    const redirectUrl = new URL(
      isNewUser ? "/auth/register" : "/auth/login",
      process.env.NEXT_PUBLIC_BASE_URL,
    );
    redirectUrl.searchParams.set("token", token);

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("Error during GitHub OAuth:", error);

    // Redirect to the frontend with an error message
    const redirectUrl = new URL(
      "/auth/login",
      process.env.NEXT_PUBLIC_BASE_URL,
    );
    redirectUrl.searchParams.set("error", "Failed to authenticate with GitHub");

    return NextResponse.redirect(redirectUrl.toString());
  }
}
