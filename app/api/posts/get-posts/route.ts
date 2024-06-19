// app/api/posts/get-posts/route.ts
import pool from "@/lib/db";

export const GET = async () => {
  try {
    const queryText = `
      SELECT
        p.id,
        p.user_id AS "userId",
        p.title,
        p.content,
        p.main_image AS "mainImage",
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt",
        p.reading_time,
        p.status,
        p.claps,
        p.comments_count AS "commentsCount",
        json_build_object(
          'id', u.id,
          'name', u.name,
          'username', u.username,
          'avatarUrl', u.avatar_url
        ) AS author,
        (SELECT t.name FROM tags t JOIN post_tags pt ON pt.tag_id = t.id WHERE pt.post_id = p.id LIMIT 1) AS tag
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `;

    const { rows } = await pool.query(queryText);

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred while fetching posts" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};
