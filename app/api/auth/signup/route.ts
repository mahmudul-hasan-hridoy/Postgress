import bcrypt from "bcrypt";
import pool from "@/lib/db";

export async function POST(req) {
  const { name, email, password } = await req.json();

  try {
    // Check if the email already exists
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (rows.length > 0) {
      return new Response("Email already in use", { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
      [name, email, hashedPassword],
    );

    return new Response("Sign-up successful", { status: 201 });
  } catch (error) {
    console.error("Error signing up:", error);
    return new Response("Sign-up failed", { status: 500 });
  }
}
