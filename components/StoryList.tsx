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
  reading_time: number;
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
        {[...Array(6)].map((_, index) => (
          <div key={index} className="p-4 border-b animate-pulse">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-col flex-1">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-2/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="w-[150px] h-[100px] bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {posts.map((post) => (
        <div key={post.id} className="p-4 border-b">
          <div className="flex items-center">
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

          <div className="flex items-center">
            <div className="flex-1">
              <h2 className="font-bold line-clamp-2 text-ellipsis text-xl">
                <Link href={`/posts/${post.id}`}>{post.title}</Link>
              </h2>
            </div>
            {post.mainImage && (
              <div className="ml-2 w-[100px] h-[80px] relative">
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

          <div className="flex items-center justify-between mt-1">
            <div>
              <div className="mt-2 flex items-center tags-container">
                {post.tag && (
                  <span className="tag-link bg-[#f4f4f4] dark:bg-gray-700 text-[#333] dark:text-gray-300 ml-2">
                    {post.tag}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                {post.reading_time} min read
              </span>
            </div>

            <div className="flex items-center">
              <button
                onClick={() => handleBookmark(post.id)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Bookmark className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
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
