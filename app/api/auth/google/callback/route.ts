// api/auth/google/callback/route.ts
import { getGoogleUser } from "@/lib/google-auth";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";

export const GET = async (req) => {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return new Response(JSON.stringify({ error: "Missing code parameter" }), {
      status: 400,
    });
  }

  try {
    const { email, picture, name } = await getGoogleUser(code);
    let user = await findUserByEmail(email);
    if (!user) {
      user = await createUser(name, email, picture);
    }
    const token = generateToken(user);
    return new Response(JSON.stringify({ token }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error processing Google user:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process Google user" }),
      { status: 500 },
    );
  }
};

const findUserByEmail = async (email) => {
  const client = await pool.connect();
  const query = "SELECT * FROM users WHERE email = $1";
  const values = [email];

  try {
    const result = await client.query(query, values);
    return result.rows[0];
  } finally {
    client.release();
  }
};

const createUser = async (name, email, avatarUrl) => {
  const client = await pool.connect();
  const query = `
    INSERT INTO users (name, email, avatar_url, created_at, updated_at) 
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING id, name, email, avatar_url
  `;
  const values = [name, email, avatarUrl, new Date(), new Date()];

  try {
    const result = await client.query(query, values);
    return result.rows[0];
  } finally {
    client.release();
  }
};

const generateToken = (user) => {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatar_url,
  };
  const secret = process.env.JWT_SECRET; // Ensure this is set in your environment variables
  const options = { expiresIn: "7d" }; // Token expiration time

  return jwt.sign(payload, secret, options);
};
