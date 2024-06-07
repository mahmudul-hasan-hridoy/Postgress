import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import pool from "@/lib/db"; // Assuming you have a database connection pool set up

interface ShortUrlResponse {
  shortUrl: string;
  originalUrl: string;
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    // Generate a unique short ID
    const shortId = nanoid(8);

    // Construct the short URL
    const shortUrl = `${req.headers.get("origin")}/${shortId}`;

    // Store the mapping in the database
    await pool.query(
      "INSERT INTO urls (short_id, original_url, short_url) VALUES ($1, $2, $3)",
      [shortId, url, shortUrl],
    );

    const response: ShortUrlResponse = {
      shortUrl,
      originalUrl: url,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "An error occurred while shortening the URL" },
      { status: 500 },
    );
  }
}
