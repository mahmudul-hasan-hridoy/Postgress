// app/posts/[id]/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";
import hljs from "highlight.js";

const PostPage = ({ params }) => {
  const router = useRouter();
  const { id } = params;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${id}`);
        const data = await response.json();
        setPost(data);
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  useEffect(() => {
    hljs.highlightAll();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="mb-3 mt-2 text-left text-2xl tracking-tight dark:text-white lg:text-4xl lg:leading-snug font-bold">
        {post.title}
      </h1>
      <div className="flex items-center mb-4">
        {post.author && post.author.avatarUrl && (
          <div className="relative h-8 w-8 overflow-hidden rounded-full flex-shrink-0">
            <Image
              src={post.author.avatarUrl}
              alt={post.author.name}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="ml-3">
          <span className="author-name font-medium text-gray-700 dark:text-gray-300">
            {post.author ? post.author.name : "Unknown Author"}
          </span>
          <span className="text-gray-500 dark:text-gray-300 mx-2">·</span>
          <span className="post-date text-sm text-gray-500 dark:text-gray-300">
            <time dateTime={post.createdAt}>
              {format(new Date(post.createdAt), "MMMM d, yyyy")}
            </time>
          </span>
        </div>
      </div>

      {post.mainImage && (
        <div className="relative mx-auto mt-4 aspect-video max-w-screen-md overflow-hidden rounded-md md:mx-auto lg:rounded-lg">
          <Image
            src={post.mainImage}
            alt={post.title}
            priority
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}
      <div
        className="prose prose-lg mx-auto my-3 text-base dark:prose-invert prose-a:text-blue-500 md:text-xl"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      <div className="tags flex flex-wrap gap-2 mb-4">
        {post.tags &&
          post.tags.map((tag) => (
            <span
              key={tag}
              className="tag text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          {post.claps} claps
        </span>
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          {post.commentsCount} comments
        </span>
      </div>
    </div>
  );
};

export default PostPage;
