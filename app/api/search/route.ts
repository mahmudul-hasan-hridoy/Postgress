// app/api/search/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "Search query missing" },
      { status: 400 }
    );
  }

  try {
    const searchQuery = `
      SELECT
        p.id,
        p.user_id AS "userId",
        p.title,
        p.content,
        p.main_image AS "mainImage",
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt",
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
      WHERE 
        p.title ILIKE $1 OR
        p.content ILIKE $1 OR
        EXISTS (
          SELECT 1 FROM tags t
          JOIN post_tags pt ON pt.tag_id = t.id
          WHERE pt.post_id = p.id AND t.name ILIKE $1
        )
    `;

    const values = [`%${query}%`];
    const { rows } = await pool.query(searchQuery, values);

    return NextResponse.json(rows, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error searching posts:", error);
    return NextResponse.json(
      { error: "An error occurred while searching for posts" },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};