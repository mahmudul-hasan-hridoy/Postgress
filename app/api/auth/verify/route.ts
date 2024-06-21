// app/api/auth/verify/route.js
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { email, verificationCode } = await req.json();

    const client = await pool.connect();
    try {
      // Check existing users
      let result = await client.query(
        "SELECT * FROM users WHERE email = $1 AND verification_code = $2",
        [email, verificationCode],
      );

      if (result.rows.length > 0) {
        const user = result.rows[0];
        // Clear the verification code
        await client.query(
          "UPDATE users SET verification_code = NULL WHERE email = $1",
          [email],
        );

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

        return NextResponse.json({
          token,
          message: "Verification successful",
          isNewUser: false,
        });
      } else {
        // Check pending users
        result = await client.query(
          "SELECT * FROM pending_users WHERE email = $1 AND verification_code = $2",
          [email, verificationCode],
        );

        if (result.rows.length > 0) {
          // Clear the verification code
          await client.query(
            "UPDATE pending_users SET verification_code = NULL WHERE email = $1",
            [email],
          );

          return NextResponse.json({
            message: "Verification successful",
            isNewUser: true,
          });
        } else {
          return NextResponse.json(
            { error: "Invalid verification code" },
            { status: 400 },
          );
        }
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in verify:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
