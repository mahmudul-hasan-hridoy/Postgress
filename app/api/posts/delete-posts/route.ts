import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";

export const DELETE = async (req: NextRequest) => {
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

    // Get the postId from the request body
    const { postId } = await req.json();

    // Start a transaction
    await pool.query("BEGIN");

    try {
      // Delete the tags associated with the post
      const deleteTagsQuery = `
        DELETE FROM post_tags
        WHERE post_id = $1;
      `;
      await pool.query(deleteTagsQuery, [postId]);

      // Delete the post
      const deletePostQuery = `
        DELETE FROM posts
        WHERE id = $1 AND user_id = $2;
      `;
      const result = await pool.query(deletePostQuery, [postId, userId]);
      if (result.rowCount === 0) {
        await pool.query("ROLLBACK");
        return NextResponse.json(
          { error: "Post not found or not authorized to delete" },
          { status: 404 },
        );
      }

      // Commit the transaction
      await pool.query("COMMIT");

      return NextResponse.json(
        { message: "Post deleted successfully" },
        { status: 200 },
      );
    } catch (error) {
      // Rollback the transaction in case of error
      await pool.query("ROLLBACK");
      console.error("Error deleting post and tags:", error);
      return NextResponse.json(
        { error: "An error occurred while deleting the post and tags" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error handling request:", error);
    return NextResponse.json(
      { error: "An error occurred while handling the request" },
      { status: 500 },
    );
  }
};

export const runtime = "nodejs";
