// app/auth/google/route.js
import { getGoogleUser } from "@/lib/google-auth";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";

// Function to generate a unique username from the name
const generateUsername = async (name) => {
  // Remove spaces and convert to lowercase
  const baseUsername = name.replace(/\s+/g, "").toLowerCase();

  let username = baseUsername;
  let counter = 1;

  const client = await pool.connect();

  try {
    while (true) {
      const existingUser = await client.query(
        "SELECT * FROM users WHERE username = $1",
        [username],
      );

      if (existingUser.rows.length === 0) {
        return username; 
      }

      username = `${baseUsername}${counter}`;
      counter++;
    }
  } finally {
    client.release();
  }
};

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) {
    return NextResponse.json(
      { error: "Code is missing from query parameters" },
      { status: 400 },
    );
  }

  try {
    const { email, picture, name } = await getGoogleUser(code);

    // Check if the user already exists
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    let user;
    let isNewUser = false;

    if (rows.length > 0) {
      user = rows[0];
      if (user.provider !== "google") {
        const redirectUrl = new URL(
          "/auth/register",
          process.env.NEXT_PUBLIC_BASE_URL,
        );
        redirectUrl.searchParams.set(
          "exist",
          "Email already exists with a different provider",
        );
        return NextResponse.redirect(redirectUrl.toString());
      }
    } else {
      isNewUser = true;

      // Generate a unique username
      const username = await generateUsername(name);

      // Generate a verification token
      const verificationToken = uuidv4();

      // Store new user data in the database
      const now = new Date();
      const { rows: newRows } = await pool.query(
        `INSERT INTO users (name, username, email, avatar_url, provider, verification_token, email_verified, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, name, username, email, avatar_url, provider, verification_token, email_verified`,
        [
          name,
          username,
          email,
          picture,
          "google",
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
        username: user.username,
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
    console.error("Error during Google OAuth:", error);

    // Redirect to the frontend with an error message
    const redirectUrl = new URL(
      "/auth/login",
      process.env.NEXT_PUBLIC_BASE_URL,
    );
    redirectUrl.searchParams.set("error", "Failed to authenticate with Google");

    return NextResponse.redirect(redirectUrl.toString());
  }
}
