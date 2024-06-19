// app/api/posts/[id]/route.ts
import pool from "@/lib/db";

export const GET = async (
  request: Request,
  context: { params: { id: string } },
) => {
  const { id } = context.params;

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
        ARRAY(
          SELECT t.name FROM tags t
          JOIN post_tags pt ON pt.tag_id = t.id
          WHERE pt.post_id = p.id
        ) AS tags
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
    `;

    const { rows } = await pool.query(queryText, [id]);

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(JSON.stringify(rows[0]), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred while fetching the post" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};