import fetch from "node-fetch";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import sendVerificationEmail from "@/lib/sendVerificationEmail";
import { v4 as uuidv4 } from "uuid";

export const GET = async (req, res) => {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return new Response(
      JSON.stringify({ error: "Code is missing from query parameters" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
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
      return new Response(
        JSON.stringify({ error: "Failed to retrieve access token" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
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

    // Combine user data with primary email
    const user = {
      ...userData,
      primaryEmail,
    };

    // Generate a verification token
    const verificationToken = uuidv4();

    // Store user data in the database
    const now = new Date();
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, avatar_url, provider, verification_token, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, avatar_url, provider, verification_token`,
      [
        user.name,
        user.primaryEmail,
        user.avatar_url,
        "github",
        verificationToken,
        new Date(),
        new Date(),
      ],
    );

    const storedUser = rows[0];

    // Send verification email
    await sendVerificationEmail(storedUser.email, verificationToken);

    console.log(storedUser);
    return new Response(JSON.stringify(storedUser), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
