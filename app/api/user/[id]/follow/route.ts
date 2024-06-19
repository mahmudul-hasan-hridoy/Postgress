import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";

export async function POST(request: Request, { params }) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json(
      { message: "Authorization header missing" },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const authorId = params.id;

    if (userId === authorId) {
      return NextResponse.json(
        { message: "You cannot follow yourself" },
        { status: 400 }
      );
    }

    await pool.query(
      "INSERT INTO followers (follower_id, followed_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [userId, authorId]
    );

    return NextResponse.json({ message: "User followed successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Invalid or expired token" },
      { status: 403 }
    );
  }
}

export const runtime = "nodejs";