"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
import hljs from "highlight.js";

const PostPage = ({ params }) => {
  const router = useRouter();
  const { id } = params;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${id}`);
        const data = await response.json();
        setPost(data);

        // Check if the current user is following the author
        const followResponse = await fetch(
          `/api/user/${data.author.id}/is-following`,
        );
        const followData = await followResponse.json();
        setIsFollowing(followData.isFollowing);
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  useEffect(() => {
    if (post && post.content) {
      hljs.highlightAll();
    }
  }, [post]);

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/user/${post.author.id}/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const sanitizedContent = post ? DOMPurify.sanitize(post.content) : "";

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
      <div className="mt-3 flex space-x-3 text-gray-500 ">
        <div className="flex items-center gap-3">
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
          <div>
            <div className="flex">
              <p className="text-gray-800 dark:text-gray-400">
                <span>{post.author ? post.author.name : "Unknown Author"}</span>
              </p>
              {/* Here add follow button */}
              {!isFollowing && (
                <button onClick={handleFollow} className="ml-3 text-green-800">
                  Follow
                </button>
              )}
              {isFollowing && (
                <span className="ml-3 text-gray-500">
                  Following
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="post-date text-sm text-gray-500 dark:text-gray-300">
                <time dateTime={post.createdAt}>
                  {format(post.createdAt, "MMMM d, yyyy")}
                </time>
              </span>
              <span className="flex items-center gap-1">
                · {post.reading_time} min read
              </span>
            </div>
          </div>
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
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
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
