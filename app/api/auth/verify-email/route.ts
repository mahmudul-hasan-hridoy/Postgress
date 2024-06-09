import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const verificationToken = searchParams.get("token");

  try {
    const query =
      "UPDATE users SET email_verified = true WHERE verification_token = $1";
    const values = [verificationToken];
    await pool.query(query, values);

    // Redirect the user to a success page or the login page
    return NextResponse.redirect(
      `${process.env.SITE_URL}/auth/register?verified=true`,
    );
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(
      `${process.env.SITE_URL}/auth/signup?error=verification_failed`,
    );
  }
}
