import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";

export const DELETE = async (
  request: NextRequest,
  context: { params: { id: string; commentId: string } },
) => {
  const { id, commentId } = context.params;
  console.log("postId:", id);
  console.log("commentId:", commentId);
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json(
      { message: "Authorization header missing" },
      { status: 401 },
    );
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id: userId } = jwt.verify(token, process.env.JWT_SECRET) as {
      id: number;
    };
    const checkCommentQuery = `
      SELECT user_id
      FROM comments
      WHERE id = $1 AND post_id = $2
    `;
    const { rows } = await pool.query(checkCommentQuery, [commentId, id]);
    console.log("Comment check result:", rows);
    if (rows.length === 0) {
      console.log("Comment not found");
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }
    if (rows[0].user_id !== userId) {
      console.log("Forbidden");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const deleteCommentQuery = `
        DELETE FROM comments
        WHERE id = $1 AND post_id = $2
        RETURNING *
      `;
      const { rowCount } = await client.query(deleteCommentQuery, [
        commentId,
        id,
      ]);
      if (rowCount === 0) {
        console.log("Comment not found");
        await client.query("ROLLBACK");
        return NextResponse.json(
          { error: "Comment not found" },
          { status: 404 },
        );
      }
      const decrementCommentsCountQuery = `
        UPDATE posts
        SET comments_count = comments_count - 1
        WHERE id = $1
      `;
      await client.query(decrementCommentsCountQuery, [id]);
      await client.query("COMMIT");
      console.log("Comment deleted successfully");
      return NextResponse.json(
        { message: "Comment deleted successfully" },
        { status: 200 },
      );
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error deleting comment:", error);
      return NextResponse.json(
        { error: "An error occurred while deleting the comment" },
        { status: 500 },
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the comment" },
      { status: 500 },
    );
  }
};
