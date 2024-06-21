// app/api/auth/signup/route.js
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { storage } from "@/lib/firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";

// Function to generate a unique username from the name
const generateUsername = async (name) => {
  // Remove spaces and convert to lowercase
  const baseUsername = name.replace(/\s+/g, "").toLowerCase();

  let username = baseUsername;
  let counter = 1;

  const client = await pool.connect();

  try {
    while (true) {
      // Check if username already exists
      const existingUser = await client.query(
        "SELECT * FROM users WHERE username = $1",
        [username],
      );

      if (existingUser.rows.length === 0) {
        return username; // Found a unique username
      }

      // Append counter to make it unique
      username = `${baseUsername}${counter}`;
      counter++;
    }
  } finally {
    client.release();
  }
};

export async function POST(req) {
  try {
    const { name, email, password, avatarUrl } = await req.json();

    const client = await pool.connect();
    try {
      // Check if user already exists
      const existingUser = await client.query(
        "SELECT * FROM users WHERE email = $1",
        [email],
      );
      if (existingUser.rows.length > 0) {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 400 },
        );
      }

      const username = await generateUsername(name);
      const verificationToken = uuidv4();
      // Upload the avatar to Firebase Storage
      const avatarRef = ref(storage, `avatars/${username}.png`);
      const avatarBuffer = Buffer.from(avatarUrl.split(",")[1], "base64");
      await uploadString(avatarRef, avatarBuffer.toString("base64"), "base64");
      const storedAvatarUrl = await getDownloadURL(avatarRef);
      console.log("Stored avatar URL:", storedAvatarUrl);

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert new user
      const result = await client.query(
        "INSERT INTO users (name, username, email, password, avatar_url,provider, verification_token) VALUES ($1, $2, $3, $4, $5, $6,$7) RETURNING id, email, name",
        [
          name,
          username,
          email,
          hashedPassword,
          avatarUrl,
          "email",
          verificationToken,
        ],
      );

      const newUser = result.rows[0];

      // Generate JWT token
      const token = jwt.sign(
        {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          avatarUrl: newUser.avatar_url,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );

      return NextResponse.json({ token, message: "User created successfully" });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in signup:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
