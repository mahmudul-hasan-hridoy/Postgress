"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
import hljs from "highlight.js";
import { toast } from "sonner";
import CommentSection from "@/components/CommentSection";

const PostPage = ({ params }) => {
  const router = useRouter();
  const { id } = params;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch post");
        }
        const data = await response.json();
        setPost(data);
        if (Array.isArray(data.comments)) {
          setComments(data.comments);
        } else {
          setComments([]);
        }
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

  const sanitizedContent = post ? DOMPurify.sanitize(post.content) : "";

  const handleCommentSubmit = (newComment) => {
    setComments((prevComments) => [...prevComments, newComment]);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="mb-3">
            <div className="h-12 bg-gray-300 dark:bg-gray-700 w-full rounded-lg"></div>
          </div>
          <div className="max-w-[300px] w-full flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
            <div className="w-full flex flex-col gap-2">
              <div className="h-3 w-3/5 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-3 w-4/5 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
          <div className="aspect-video mt-5 w-full bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
          {[...Array(4)].map((_, index) => (
            <div key={index} className="mt-10 space-y-3">
              <div className="h-5 w-2/3 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-5 w-full bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-5 w-full bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-5 w-full bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-5 w-full bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-5 w-full bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
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
              {/* Add follow button here */}
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="post-date text-sm text-gray-500 dark:text-gray-300">
                <time dateTime={post.createdAt}>
                  {format(new Date(post.createdAt), "MMMM d, yyyy")}
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
      <div className="flex items-center mb-4">
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          {post.claps} claps
        </span>
      </div>
      <CommentSection
        comments={comments}
        postId={post.id}
        onCommentSubmit={handleCommentSubmit}
      />
    </div>
  );
};

export default PostPage;
