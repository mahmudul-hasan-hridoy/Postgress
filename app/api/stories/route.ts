// app/api/stories/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";

export const GET = async (req) => {
  const authHeader = req.headers.get("Authorization");
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

    const query = `
      SELECT id, title, subtitle, author, tags, content, reading_time, links, main_image
      FROM stories
      WHERE author @> $1
    `;
    const values = [JSON.stringify([{ author_id: userId }])];

    const { rows } = await pool.query(query, values);

    return NextResponse.json({ stories: rows });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Invalid or expired token" },
      { status: 403 },
    );
  }
};
