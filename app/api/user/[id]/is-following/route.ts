import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";

export async function GET(request: Request, { params }) {
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
    const authorId = params.id;

    const { rows } = await pool.query(
      "SELECT 1 FROM followers WHERE follower_id = $1 AND followed_id = $2",
      [userId, authorId],
    );

    const isFollowing = rows.length > 0;

    return NextResponse.json({ isFollowing });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Invalid or expired token" },
      { status: 403 },
    );
  }
}

export const runtime = "nodejs";
