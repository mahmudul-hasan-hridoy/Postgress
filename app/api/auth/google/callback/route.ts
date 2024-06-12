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
    const user = await findOrCreateUser(name, email, picture);

    if (user.email_verified && user.provider === "google") {
      const token = generateToken(user);
      return redirectWithMessage(
        "/auth/login",
        "success",
        "loginWithGoogle",
        token,
      );
    } else if (!user.email_verified) {
      await sendVerificationEmail(email, user.verification_token);
      const token = generateToken(user);
      return redirectWithMessage(
        "/auth/register",
        "success",
        "signedUpWithGoogle",
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

const findOrCreateUser = async (name, email, avatarUrl) => {
  const client = await pool.connect();
  try {
    let user = await findUserByEmail(client, email);
    if (!user) {
      const verificationToken = uuidv4();
      user = await createUser(
        client,
        name,
        email,
        avatarUrl,
        verificationToken,
      );
    }
    return user;
  } finally {
    client.release();
  }
};

const findUserByEmail = async (client, email) => {
  const query = "SELECT * FROM users WHERE email = $1";
  const values = [email];
  const result = await client.query(query, values);
  return result.rows[0];
};

const createUser = async (
  client,
  name,
  email,
  avatarUrl,
  verificationToken,
) => {
  const query = `
    INSERT INTO users (id,name, email, avatar_url, verification_token, provider, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7,$8)
    RETURNING id, name, email, avatar_url, verification_token, email_verified
  `;
  const values = [
    uuidv4(),
    name,
    email,
    avatarUrl,
    verificationToken,
    "google",
    new Date(),
    new Date(),
  ];
  const result = await client.query(query, values);
  return result.rows[0];
};

const generateToken = (user) => {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatar_url,
    emailVerified: user.email_verified,
  };
  const secret = process.env.JWT_SECRET;
  const options = { expiresIn: "7d" };
  return jwt.sign(payload, secret, options);
};

const redirectWithMessage = (url, status, message, token = "") => {
  const redirectUrl = new URL(url, process.env.NEXT_PUBLIC_BASE_URL);
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
