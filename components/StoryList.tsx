// components/StoryList.tsx
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { Bookmark } from "lucide-react";

interface User {
  id: number;
  name: string;
  username: string;
  avatarUrl: string | null;
}

interface Post {
  id: number;
  userId: number;
  title: string;
  content: string;
  mainImage: string | null;
  createdAt: string;
  updatedAt: string;
  status: string;
  claps: number;
  commentsCount: number;
  author: User | null;
  tag: string | null;
}

const StoryList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/posts/get-posts");
        const data = await response.json();
        setPosts(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleBookmark = async (postId: number) => {
    console.log("Bookmark clicked for post:", postId);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Render loading skeleton */}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {posts.map((post) => (
        <div key={post.id} className="p-4 border-b">
          <div className="flex items-center mb-2">
            <div>
              {post.author && post.author.avatarUrl && (
                <div className="relative h-6 w-6 overflow-hidden rounded-full flex-shrink-0">
                  <Image
                    src={post.author.avatarUrl}
                    alt={post.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
            <div className="ml-2">
              <span className="author-name font-medium text-gray-500 dark:text-gray-300">
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

          <div className="flex">
            <div className="flex-1">
              <h2 className="blog-item-title font-bold line-clamp-2 text-ellipsis text-xl">
                <Link href={`/posts/${post.id}`}>{post.title}</Link>
              </h2>
              <div className="mt-2 flex items-center tags-container">
                {post.tag && (
                  <span className="tag-link bg-[#f4f4f4] dark:bg-gray-700 text-[#333] dark:text-gray-300 ml-2">
                    {post.tag}
                  </span>
                )}
              </div>
            </div>
            {post.mainImage && (
              <div className="ml-4 w-[100px] h-[100px] relative">
                <Link href={`/posts/${post.id}`}>
                  <Image
                    src={post.mainImage}
                    alt={post.title}
                    loading="lazy"
                    fill
                    className="object-contain"
                  />
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => handleBookmark(post.id)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Bookmark className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <div className="flex items-center">
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {post.claps} claps
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-sm ml-4">
                {post.commentsCount} comments
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StoryList;
