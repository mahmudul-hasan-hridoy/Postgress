// lib/auth.js
"use server";
import jwt from "jsonwebtoken";

export async function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}
