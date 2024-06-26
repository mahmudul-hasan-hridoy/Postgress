import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";

export async function PUT(request: Request) {
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

    const { name, email, avatarUrl } = await request.json();

    const updated_at = new Date(); // Define updated_at here

    const query =
      "UPDATE users SET name = $1, email = $2, avatar_url = $3, updated_at = $4 WHERE id = $5 RETURNING id";
    const values = [name, email, avatarUrl, updated_at, userId];

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Invalid or expired token" },
      { status: 403 },
    );
  }
}
