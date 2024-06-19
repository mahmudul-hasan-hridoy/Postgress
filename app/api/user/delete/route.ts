import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";

export async function DELETE(request: Request) {
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

    // Start a transaction to ensure atomicity
    await pool.query("BEGIN");

    // Delete all posts related to the user
    await pool.query("DELETE FROM posts WHERE user_id = $1", [userId]);

    // Delete the user
    const query = "DELETE FROM users WHERE id = $1 RETURNING id";
    const values = [userId];
    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      await pool.query("ROLLBACK");
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Commit the transaction
    await pool.query("COMMIT");
    return NextResponse.json({
      message: "Account and all related posts deleted successfully",
    });
  } catch (error) {
    console.error(error);
    await pool.query("ROLLBACK");
    return NextResponse.json(
      { message: "Invalid or expired token" },
      { status: 403 },
    );
  }
}
