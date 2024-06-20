import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export const POST = async (req: NextRequest, { params }) => {
  const { id } = params;

  try {
    const queryText = `
      UPDATE posts
      SET claps = claps + 1
      WHERE id = $1
      RETURNING *;
    `;
    const { rows } = await pool.query(queryText, [id]);
    const updatedPost = rows[0];

    if (!updatedPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error) {
    console.error("Error updating claps:", error);
    return NextResponse.json(
      { error: "An error occurred while updating claps" },
      { status: 500 },
    );
  }
};

export const runtime = "nodejs";
