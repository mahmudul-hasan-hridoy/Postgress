"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";

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
  author: User | null;
  tags: string[];
}

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/search?q=${query}`);
      if (!response.ok) {
        throw new Error("Failed to search posts");
      }
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error searching posts:", error);
      setError("An error occurred while searching for posts");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <form onSubmit={handleSearch} className="mb-8 flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts..."
          className="w-full px-4 py-2 border rounded-l focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600 transition-colors duration-200"
        >
          Search
        </button>
      </form>

      {loading && <div className="text-center text-gray-500">Loading...</div>}
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            {post.mainImage && (
              <div className="relative w-full h-48 overflow-hidden">
                <Link href={`/posts/${post.id}`}>
                  <Image
                    src={post.mainImage}
                    alt={post.title}
                    loading="lazy"
                    fill
                    className="object-cover"
                  />
                </Link>
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center mb-2">
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
                <div className="ml-2">
                  <span className="author-name font-medium text-gray-500 dark:text-gray-300">
                    {post.author ? post.author.name : "Unknown Author"}
                  </span>
                  <span className="text-gray-500 dark:text-gray-300 mx-2">
                    ·
                  </span>
                  <span className="post-date text-sm text-gray-500 dark:text-gray-300">
                    <time dateTime={post.createdAt}>
                      {format(new Date(post.createdAt), "MMMM d, yyyy")}
                    </time>
                  </span>
                </div>
              </div>

              <h2 className="blog-item-title font-bold line-clamp-2 text-ellipsis text-lg mb-2">
                <Link
                  href={`/posts/${post.id}`}
                  className="bg-gradient-to-r from-black to-black bg-[length:0px_2px] bg-left-bottom
                    bg-no-repeat
                    transition-[background-size]
                    duration-500
                    hover:bg-[length:100%_2px]
                    group-hover:bg-[length:100%_2px]
                    dark:from-white dark:to-white"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 line-clamp-3 text-ellipsis mb-4 hidden md:flex">
                {post.content.slice(0, 150)}...
              </p>

              <div className="tags flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="tag text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchPage;
