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

    // Validate input
    const { content } = await request.json();
    if (!content) {
      return NextResponse.json(
        { message: "Comment content is required" },
        { status: 400 },
      );
    }

    // Insert comment into database
    const insertQuery = `
      INSERT INTO comments (post_id, user_id, content, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, content, created_at
    `;
    const insertValues = [id, userId, content];
    const { rows: commentRows } = await pool.query(insertQuery, insertValues);
    if (commentRows.length === 0) {
      return NextResponse.json(
        { message: "Failed to add comment" },
        { status: 500 },
      );
    }

    // Increment comments_count in the posts table
    const updatePostQuery = `
      UPDATE posts
      SET comments_count = comments_count + 1
      WHERE id = $1
    `;
    await pool.query(updatePostQuery, [id]);

    const newComment = {
      id: commentRows[0].id,
      content: commentRows[0].content,
      createdAt: commentRows[0].created_at,
      author: {
        id: userId,
        name: userRows[0].name,
        email: userRows[0].email,
        avatarUrl: userRows[0].avatar_url,
      },
    };

    return NextResponse.json(newComment);
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { message: "Failed to add comment" },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
