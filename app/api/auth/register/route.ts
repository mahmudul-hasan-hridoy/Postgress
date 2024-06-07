import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "@/lib/db";

export async function POST(request: Request) {
  const { username, email, password, avatarUrl } = await request.json();
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query =
      "INSERT INTO users (username, email, password, avatar_url) VALUES ($1, $2, $3, $4) RETURNING id";
    const values = [username, email, hashedPassword, avatarUrl];
    const { rows } = await pool.query(query, values);
    const userId = rows[0].id;
    return NextResponse.json({ userId }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
