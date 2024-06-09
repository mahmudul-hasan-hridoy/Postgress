// api/auth/register/route.ts
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import pool from "@/lib/db";
import sendVerificationEmail from "@/lib/sendVerificationEmail";

export const POST = async (req) => {
  const { name, email, password, avatarUrl } = await req.json();

  try {
    const client = await pool.connect();

    try {
      // Check if user with the same email already exists
      const existingUser = await client.query(
        "SELECT * FROM users WHERE email = $1",
        [email],
      );

      if (existingUser.rows.length > 0) {
        return new Response(JSON.stringify({ error: "Email already exists" }), {
          status: 400,
        });
      }

      // Email/password sign-up
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const verificationToken = uuidv4();

      const query =
        "INSERT INTO users (name, email, password, avatar_url, verification_token, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id";
      const values = [
        name,
        email,
        hashedPassword,
        avatarUrl,
        verificationToken,
        new Date(),
        new Date(),
      ];
      const result = await client.query(query, values);
      const newUser = result.rows[0];

      await sendVerificationEmail(email, verificationToken);

      return new Response(JSON.stringify({ userId: newUser.id }), {
        status: 201,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500,
    });
  }
};

export const GET = () => {
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
  });
};

export const PUT = () => {
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
  });
};

export const DELETE = () => {
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
  });
};
