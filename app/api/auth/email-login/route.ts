// pages/api/auth/email-login.js
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import pool from "@/lib/db";
import sendEmail from "@/lib/sendEmail"; // Assuming you have a utility to send emails

const generateUsername = async (baseUsername) => {
  let username = baseUsername.toLowerCase().replace(/\s+/g, "");
  let counter = 1;
  const client = await pool.connect();

  try {
    while (true) {
      const existingUser = await client.query(
        "SELECT * FROM users WHERE username = $1",
        [username],
      );

      if (existingUser.rows.length === 0) {
        return username;
      }

      username = `${baseUsername.toLowerCase().replace(/\s+/g, "")}${counter}`;
      counter++;
    }
  } finally {
    client.release();
  }
};

const handler = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: "Email is required" });
  }

  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    let user;
    let isNewUser = false;

    if (rows.length > 0) {
      user = rows[0];
    } else {
      isNewUser = true;
      const username = await generateUsername(email.split("@")[0]);
      const now = new Date();
      const verificationToken = uuidv4();
      const { rows: newRows } = await pool.query(
        `INSERT INTO users (name, username, email, avatar_url, provider, verification_token, email_verified, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, name, username, email, avatar_url, provider, verification_token, email_verified`,
        [email, username, email, null, "email", verificationToken, true, now, now],
      );
      user = newRows[0];
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatar_url,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    const loginUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/m/callback/email?token=${token}`;
    await sendEmail(
      email,
      "Login to Medium",
      `Click here to login: ${loginUrl}`,
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error during email login:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

export default handler;
