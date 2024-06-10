import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";

export async function GET(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json(
      { message: "Authorization header missing" },
      { status: 401 },
    );
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const query =
      "SELECT name, email, avatar_url,updated_at FROM users WHERE id = $1";
    const values = [userId];
    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { name, email, avatar_url, updated_at } = rows[0];
    return NextResponse.json({
      name,
      email,
      avatarUrl: avatar_url,
      updated_at,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Invalid or expired token" },
      { status: 403 },
    );
  }
}
