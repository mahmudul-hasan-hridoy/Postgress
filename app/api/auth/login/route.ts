// api/auth/login/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  try {
    const query = "SELECT * FROM users WHERE email = $1";
    const values = [email];
    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    if (!user.email_verified) {
      return NextResponse.json(
        { message: "Please verify your email address" },
        { status: 403 },
      );
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatar_url,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );
    console.log(token);

    return NextResponse.json({ token, email_verified: user.email_verified });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
