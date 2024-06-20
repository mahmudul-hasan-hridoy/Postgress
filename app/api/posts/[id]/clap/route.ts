import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";

export async function POST(request, { params }) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json(
      { message: "Authorization header missing" },
      { status: 401 },
    );
  }

  const token = authHeader.split(" ")[1];
  const { id } = params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Check if user exists
    const userQuery = "SELECT * FROM users WHERE id = $1";
    const userValues = [userId];
    const { rows: userRows } = await pool.query(userQuery, userValues);
    if (userRows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if user already clapped this post
    const clapQuery = "SELECT * FROM likes WHERE post_id = $1 AND user_id = $2";
    const clapValues = [id, userId];
    const { rows: clapRows } = await pool.query(clapQuery, clapValues);
    if (clapRows.length > 0) {
      return NextResponse.json(
        { message: "You have already clapped this post" },
        { status: 400 },
      );
    }

    // Insert clap into database
    const insertQuery = `
      INSERT INTO likes (post_id, user_id, created_at)
      VALUES ($1, $2, NOW())
      RETURNING post_id, COUNT(*) AS likes
    `;
    const insertValues = [id, userId];
    const { rows: clapInsertRows } = await pool.query(
      insertQuery,
      insertValues,
    );
    if (clapInsertRows.length === 0) {
      return NextResponse.json(
        { message: "Failed to clap post" },
        { status: 500 },
      );
    }

    // Update post claps count
    const updateQuery = `
      UPDATE posts
      SET likes = $1
      WHERE id = $2
      RETURNING claps
    `;
    const updateValues = [clapInsertRows[0].likes, id];
    const { rows: updateRows } = await pool.query(updateQuery, updateValues);
    if (updateRows.length === 0) {
      return NextResponse.json(
        { message: "Failed to update post claps count" },
        { status: 500 },
      );
    }

    const updatedPost = {
      likes: updateRows[0].likes,
    };
    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error clapping post:", error);
    return NextResponse.json(
      { message: "Failed to clap post" },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
