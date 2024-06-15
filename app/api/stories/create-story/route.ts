import jwt from "jsonwebtoken";
import pool from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { NextRequest, NextResponse } from "next/server";
import readingTime from "reading-time";

export const POST = async (request: NextRequest) => {
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
    const userName = decoded.name;
    const userEmail = decoded.email;
    const userAvatarUrl = decoded.avatarUrl;

    const { title, subtitle, content, tags, main_image } = await request.json();

    const stats = readingTime(content);

    const authorDetails = {
      author_id: userId,
      name: userName,
      email: userEmail,
      avatarUrl: userAvatarUrl,
    };

    const query = `
      INSERT INTO stories (id, title, subtitle, author, content, tags, reading_time, links, main_image)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;
    const values = [
      uuidv4(),
      title,
      subtitle,
      JSON.stringify([authorDetails]),
      content,
      tags,
      stats.text,
      { self: "", canonical: "" },
      main_image,
    ];

    const { rows } = await pool.query(query, values);
    const newStoryId = rows[0].id;
    const storyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/stories/${newStoryId}`;

    const updateQuery = "UPDATE stories SET links = $1 WHERE id = $2";
    const updateValues = [{ self: storyUrl, canonical: storyUrl }, newStoryId];
    await pool.query(updateQuery, updateValues);

    return NextResponse.json(
      { message: "Story created successfully", storyUrl },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Invalid or expired token" },
      { status: 403 },
    );
  }
};

export const runtime = "nodejs";
