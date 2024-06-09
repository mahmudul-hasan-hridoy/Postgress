// app/auth/google/route.js
import { getGoogleUser } from "@/lib/google-auth";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return redirectWithMessage("/auth/signup", "error", "missingCode");
  }

  try {
    const { email, picture, name } = await getGoogleUser(code);
    let user = await findUserByEmail(email);
    const token = generateToken(user);

    if (!user) {
      user = await createUser(name, email, picture);
      return redirectWithMessage(
        "/auth/signup",
        "success",
        "signedUpWithGoogle",
        token,
      );
    } else {
      return redirectWithMessage(
        "/auth/login",
        "success",
        "loginWithGoogle",
        token,
      );
    }
  } catch (error) {
    console.error("Error processing Google user:", error);
    return redirectWithMessage("/auth/signup", "error", "signUpFailed");
  }
}

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
  const secret = process.env.JWT_SECRET;
  const options = { expiresIn: "7d" };
  return jwt.sign(payload, secret, options);
};

const redirectWithMessage = (url, status, message, token = "") => {
  const redirectUrl = new URL(url, process.env.SITE_URL);
  redirectUrl.searchParams.append("status", status);
  redirectUrl.searchParams.append("message", message);
  if (token) {
    redirectUrl.searchParams.append("token", token);
  }
  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectUrl.toString(),
    },
  });
};
