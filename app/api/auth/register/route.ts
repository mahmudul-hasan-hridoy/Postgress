import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "@/lib/db";
import sendVerificationEmail from "@/lib/sendVerificationEmail";
import crypto from 'crypto';

export async function POST(request: Request) {
  const { username, email, password, avatarUrl } = await request.json();
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = generateVerificationToken(); // Generate a unique verification token

    const query =
      "INSERT INTO users (username, email, password, avatar_url, verification_token) VALUES ($1, $2, $3, $4, $5) RETURNING id";
    const values = [username, email, hashedPassword, avatarUrl, verificationToken];
    const { rows } = await pool.query(query, values);
    const userId = rows[0].id;

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json({ userId }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

function generateVerificationToken() {
  // Generate a random 32-byte token
  const token = crypto.randomBytes(32).toString('hex');
  return token;
} 