"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Search, X } from "lucide-react";
import Cookies from "js-cookie";

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
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const storedSearches = Cookies.get("recentSearches");
    if (storedSearches) {
      setRecentSearches(JSON.parse(storedSearches));
    }
  }, []);

  const updateRecentSearches = (newQuery: string) => {
    const updatedSearches = [
      newQuery,
      ...recentSearches.filter((s) => s !== newQuery),
    ].slice(0, 5);
    setRecentSearches(updatedSearches);
    Cookies.set("recentSearches", JSON.stringify(updatedSearches), {
      expires: 30,
    });
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError("");
    setQuery(searchQuery);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`,
      );
      if (!response.ok) {
        throw new Error("Failed to search posts");
      }
      const data = await response.json();
      setPosts(data);
      updateRecentSearches(searchQuery);
    } catch (error) {
      console.error("Error searching posts:", error);
      setError("An error occurred while searching for posts");
    } finally {
      setLoading(false);
    }
  };

  const removeRecentSearch = (searchToRemove: string) => {
    const updatedSearches = recentSearches.filter((s) => s !== searchToRemove);
    setRecentSearches(updatedSearches);
    Cookies.set("recentSearches", JSON.stringify(updatedSearches), {
      expires: 30,
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Search Posts</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(query);
        }}
        className="mb-8"
      >
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts and press Enter..."
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
        </div>
      </form>

      {!query && recentSearches.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Recent searches</h2>
          <ul>
            {recentSearches.map((search, index) => (
              <li
                key={index}
                className="flex items-center justify-between mb-2"
              >
                <button
                  onClick={() => handleSearch(search)}
                  className="text-blue-600 hover:underline"
                >
                  {search}
                </button>
                <button
                  onClick={() => removeRecentSearch(search)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {loading && (
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Searching...</p>
        </div>
      )}
      {error && (
        <div className="text-red-500 text-center mb-4 p-2 bg-red-100 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105"
          >
            {post.mainImage && (
              <div className="relative w-full h-48 overflow-hidden">
                <Link href={`/posts/${post.id}`}>
                  <Image
                    src={post.mainImage}
                    alt={post.title}
                    loading="lazy"
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-110"
                  />
                </Link>
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center mb-4">
                {post.author && post.author.avatarUrl && (
                  <div className="relative h-10 w-10 overflow-hidden rounded-full flex-shrink-0 border-2 border-blue-500">
                    <Image
                      src={post.author.avatarUrl}
                      alt={post.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="ml-3">
                  <span className="font-semibold text-gray-800">
                    {post.author ? post.author.name : "Unknown Author"}
                  </span>
                  <div className="text-sm text-gray-500">
                    <time dateTime={post.createdAt}>
                      {format(new Date(post.createdAt), "MMMM d, yyyy")}
                    </time>
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-bold mb-3 line-clamp-2">
                <Link
                  href={`/posts/${post.id}`}
                  className="text-gray-900 hover:text-blue-600 transition-colors duration-200"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {post.content.slice(0, 150)}...
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <Link
                href={`/posts/${post.id}`}
                className="inline-block bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded hover:bg-blue-700 transition-colors duration-200"
              >
                Read More
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchPage;
