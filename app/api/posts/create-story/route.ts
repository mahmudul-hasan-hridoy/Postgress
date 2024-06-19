import pool from "@/lib/db";
import jwt from "jsonwebtoken";

export const metadata = {
  requireBody: true,
};

export const POST = async (req) => {
  const { title, content, tags, main_image } = await req.json();

  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Authorization header missing or malformed" }),
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];
  try {
    // Validate JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Insert story into database
    const queryText = `
      INSERT INTO posts (user_id, title, content, main_image, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id;
    `;
    const { rows } = await pool.query(queryText, [
      userId,
      title,
      content,
      main_image,
    ]);
    const postId = rows[0].id;

    // Insert tags into post_tags junction table
    for (const tagName of tags) {
      // Check if tag exists
      const tagQuery = `SELECT id FROM tags WHERE name = $1`;
      const tagResult = await pool.query(tagQuery, [tagName]);

      if (tagResult.rows.length > 0) {
        const tagId = tagResult.rows[0].id;

        // Insert into post_tags if tag exists
        const postTagQuery = `
          INSERT INTO post_tags (post_id, tag_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING;
        `;
        await pool.query(postTagQuery, [postId, tagId]);
      }
    }

    return new Response(
      JSON.stringify({
        message: "Story created successfully",
        postId,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating story:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred while creating the story" }),
      { status: 500 }
    );
  }
};

export const runtime = "nodejs";