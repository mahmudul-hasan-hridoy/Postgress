// app/auth/google/route.js
import { getGoogleUser } from "@/lib/google-auth";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import sendVerificationEmail from "@/lib/sendVerificationEmail";
import { v4 as uuidv4 } from "uuid";

export async function GET(req) {
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
      const verificationToken = uuidv4();
      user = await createUser(name, email, picture, verificationToken);
      await sendVerificationEmail(email, verificationToken);

      const token = generateToken(user);
      return redirectWithMessage(
        "/auth/register",
        "success",
        "signedUpWithGoogle",
        token,
      );
    } else if (user.email_verefied && user.provider === "google") {
      const token = generateToken(user);
      return redirectWithMessage(
        "/auth/login",
        "success",
        "loginWithGoogle",
        token,
      );
    } else {
      return redirectWithMessage("/auth/register", "error", "usertaken");
    }
  } catch (error) {
    console.error("Error processing Google user:", error);
    return redirectWithMessage("/auth/register", "error", "signUpFailed");
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

const createUser = async (name, email, avatarUrl, verificationToken) => {
  const client = await pool.connect();
  const query = `
    INSERT INTO users (name, email, avatar_url, verification_token, provider, created_at, updated_at) 
    VALUES ($1, $2, $3, $4, $5, $6, $7) 
    RETURNING id, name, email, avatar_url
  `;
  const values = [
    name,
    email,
    avatarUrl,
    verificationToken,
    "google",
    new Date(),
    new Date(),
  ];

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
