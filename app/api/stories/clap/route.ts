// app/api/stories/clap/route.js
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request) {
  const { storyId } = await request.json();

  try {
    const { rows } = await pool.query(
      "UPDATE stories SET claps = claps + 1 WHERE id = $1 RETURNING claps",
      [storyId],
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: "Story not found" }, { status: 404 });
    }

    return NextResponse.json({ claps: rows[0].claps }, { status: 200 });
  } catch (error) {
    console.error("Error updating claps:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}
