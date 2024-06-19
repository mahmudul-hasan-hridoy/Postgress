// components/UserStories.tsx
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Ellipsis } from "lucide-react";

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
  tags: string[];
  author: User | null;
}

const UserStories: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("User not authenticated");
        }

        const response = await fetch("/api/posts/get-user-posts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setPosts(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching user posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, []);

  const handleDelete = async (postId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("User not authenticated");
      }

      const response = await fetch("/api/posts/delete-posts", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId }),
      });

      if (response.ok) {
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      } else {
        const errorData = await response.json();
        console.error(errorData.message || "Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center">Loading</div>;
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
            <div className="ml-2 flex-1">
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
            <div className="relative">
              <button
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                onClick={() =>
                  document
                    .getElementById(`dropdown-${post.id}`)
                    .classList.toggle("hidden")
                }
              >
                <Ellipsis className="w-5 h-5" />
              </button>
              <div
                id={`dropdown-${post.id}`}
                className="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20"
              >
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
                  onClick={() => handleDelete(post.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div className="flex">
            <div className="flex-1">
              <h2 className="blog-item-title font-bold line-clamp-2 text-ellipsis text-xl">
                <Link href={`/posts/${post.id}`}>{post.title}</Link>
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 text-ellipsis">
                {post.content.slice(0, 100)}...
              </p>
              <div className="mt-2 flex items-center">
                {post.tags && post.tags.length > 0 && (
                  <span className="tag text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                    {post.tags[0]}
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
        </div>
      ))}
    </div>
  );
};

export default UserStories;
