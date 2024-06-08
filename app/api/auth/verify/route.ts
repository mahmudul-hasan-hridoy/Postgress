import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${process.env.SITE_URL}/auth/login`);
  }

  try {
    // Find the user with the provided verification token
    const user = await pool.query(
      "SELECT * FROM google_users WHERE verification_token = $1",
      [token],
    );

    if (user.rowCount === 0) {
      // Invalid or expired verification token
      return NextResponse.redirect(`${process.env.SITE_URL}/auth/login`);
    }

    // Update the user's email_verified column to true
    await pool.query(
      "UPDATE google_users SET email_verified = true WHERE id = $1",
      [user.rows[0].id],
    );

    // Optionally, you can redirect the user to a success page or perform additional actions
    return NextResponse.redirect(`${process.env.SITE_URL}/auth/login`);
  } catch (error) {
    console.error("Error verifying email:", error);
    // Handle error cases
    return NextResponse.redirect(`${process.env.SITE_URL}/auth/login`);
  }
}
