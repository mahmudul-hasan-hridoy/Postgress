import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";

export const DELETE = async (
  req: NextRequest,
  context: { params: { id: string } },
) => {
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
    const storyId = context.params.id;

    const query = `
      SELECT author
      FROM stories
      WHERE id = $1
    `;
    const values = [storyId];

    const { rows } = await pool.query(query, values);
    if (rows.length === 0) {
      return NextResponse.json({ message: "Story not found" }, { status: 404 });
    }

    const authorData = rows[0].author;
    const isOwner = authorData.some((author) => author.author_id === userId);

    if (!isOwner) {
      return NextResponse.json(
        { message: "Not authorized to delete this story" },
        { status: 403 },
      );
    }

    const deleteQuery = "DELETE FROM stories WHERE id = $1";
    await pool.query(deleteQuery, values);

    return NextResponse.json(
      { message: "Story deleted successfully" },
      { status: 200 },
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
