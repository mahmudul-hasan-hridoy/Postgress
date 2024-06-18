// app/api/follow/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

interface RequestBody {
  userId: string;
  authorId: string;
}

export async function POST(request: Request) {
  const { userId, authorId } = await request.json();

  try {
    const client = await pool.connect();

    try {
      // Check if the current user is already following the author
      const checkQuery = `
        SELECT following FROM users WHERE id = $1
      `;
      const checkResult = await client.query(checkQuery, [userId]);

      if (!checkResult.rows[0]) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const currentFollowing = checkResult.rows[0].following || [];

      if (currentFollowing.includes(authorId)) {
        return NextResponse.json(
          { error: "Already following this user" },
          { status: 400 },
        );
      }

      // Update the following array to include the authorId
      const updateQuery = `
        UPDATE users
        SET following = array_append(following, $1)
        WHERE id = $2
        RETURNING following
      `;
      await client.query(updateQuery, [authorId, userId]);

      return NextResponse.json(
        { message: "Successfully followed the user" },
        { status: 200 },
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error following user:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
