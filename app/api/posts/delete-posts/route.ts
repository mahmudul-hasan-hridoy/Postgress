// app/api/posts/delete-post/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

export const DELETE = async (req: NextRequest) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Authorization header missing or malformed' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Validate JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Get the postId from the request body
    const { postId } = await req.json();

    // Delete the post
    const deleteQuery = `
      DELETE FROM posts
      WHERE id = $1 AND user_id = $2;
    `;
    const result = await pool.query(deleteQuery, [postId, userId]);
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Post not found or not authorized to delete' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Post deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'An error occurred while deleting the post' }, { status: 500 });
  }
};

export const runtime = "nodejs";