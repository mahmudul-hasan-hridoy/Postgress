// app/api/posts/get-user-posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";

export const GET = async (req: NextRequest) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Authorization header missing or malformed" },
      { status: 401 },
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    // Validate JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Fetch posts created by the user
    const queryText = `
      SELECT 
        p.id,
        p.user_id AS "userId",
        p.title,
        p.content,
        p.main_image AS "mainImage",
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt",
        p.status,
        p.claps,
        p.comments_count AS "commentsCount",
        json_build_object(
          'id', u.id,
          'name', u.name,
          'username', u.username,
          'avatarUrl', u.avatar_url
        ) AS author,
        ARRAY(
          SELECT t.name FROM tags t 
          JOIN post_tags pt ON pt.tag_id = t.id 
          WHERE pt.post_id = p.id
        ) AS tags
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC;
    `;
    const { rows } = await pool.query(queryText, [userId]);
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching the user posts" },
      { status: 500 },
    );
  }
};

export const runtime = "nodejs";