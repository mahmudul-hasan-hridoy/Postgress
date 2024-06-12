import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";

export async function POST(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json({ message: "Authorization header missing" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const { title, subtitle, content, tags } = await request.json();

    const query = `
      INSERT INTO stories (id, title, subtitle, author_id, content, tags, reading_time, links)
      VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;
    const values = [title, subtitle, userId, content, tags, Math.ceil(content.length / 200), { self: "", canonical: "" }];
    const { rows } = await pool.query(query, values);

    const newStoryId = rows[0].id;
    const storyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/stories/${newStoryId}`;
    const updateQuery = "UPDATE stories SET links = $1 WHERE id = $2";
    const updateValues = [{ self: storyUrl, canonical: storyUrl }, newStoryId];
    await pool.query(updateQuery, updateValues);

    return NextResponse.json({ message: "Story created successfully", storyUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Invalid or expired token" }, { status: 403 });
  }
}