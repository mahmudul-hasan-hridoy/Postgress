import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import readingTime from "reading-time";

export const POST = async (req: NextRequest) => {
  try {
    const { title, content, tags, main_image } = await req.json();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization header missing or malformed" },
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
    const userId = decoded.id;

    const stats = readingTime(content);

    // Insert story into database
    const queryText = `
      INSERT INTO posts (user_id, title, content, main_image, created_at, updated_at, reading_time)
      VALUES ($1, $2, $3, $4, NOW(), NOW(), $5)
      RETURNING id;
    `;
    const { rows } = await pool.query(queryText, [
      userId,
      title,
      content,
      main_image,
      Math.ceil(stats.minutes),
    ]);
    const postId = rows[0].id;

    // Insert tags into post_tags junction table
    for (const tagName of tags) {
      // Check if tag exists
      const tagQuery = `SELECT id FROM tags WHERE name = $1`;
      const tagResult = await pool.query(tagQuery, [tagName]);

      if (tagResult.rows.length > 0) {
        const tagId = tagResult.rows[0].id;

        // Insert into post_tags if tag exists
        const postTagQuery = `
          INSERT INTO post_tags (post_id, tag_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING;
        `;
        await pool.query(postTagQuery, [postId, tagId]);
      }
    }

    return NextResponse.json(
      {
        message: "Story created successfully",
        postId,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating story:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the story" },
      { status: 500 },
    );
  }
};

export const runtime = "nodejs";
