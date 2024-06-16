// components/StoryList.tsx
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";

interface Author {
  author_id: string;
  name: string;
  avatarUrl: string;
}

interface Story {
  id: string;
  title: string;
  subtitle: string;
  author: Author[];
  created_at: string;
  content: object;
  tags: string[];
  claps: number;
  responses: number;
  reading_time: number;
  links: object;
}

function BookmarkIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
      />
    </svg>
  );
}

function BookmarkFilledIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const StoryList: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch("/api/stories/get-stories");
        const data = await response.json();
        console.log("Fetched Stories:", data); // Add this line to log the fetched data
        setStories(data);
      } catch (error) {
        console.error("Error fetching stories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);
  const handleBookmark = async (storyId) => {
    console.log("Bookmark clicked");
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {stories.map((story) => (
        <div key={story.id} className="p-4 border-b">
          <div className="blog-item-header flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="author-name font-medium text-gray-500 dark:text-gray-300">
                {story.author[0].name}
              </span>
              {"-"}
              <span className="post-date text-sm text-gray-500 dark:text-gray-300">
                <time dateTime={story.created_at}>
                  {format(story.created_at, "MMMM d, yyyy")}
                </time>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-1 flex-col flex-shrink-0">
              <h2 className="blog-item-title font-bold line-clamp-2 text-ellipsis text-xl">
                <Link href={`/stories/${story.id}`}>{story.title}</Link>
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 text-ellipsis"></p>
            </div>
            <div className="relative blog-item-thumbnail max-w-[150px] min-w-[150px] h-[100px]">
              <Link href={`/stories/${story.id}`}>
                {story.main_image && (
                  <Image
                    src={story.main_image}
                    alt={story.title}
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    fill
                    className="object-cover"
                  />
                )}
              </Link>
            </div>
          </div>

          <div className="blog-item-footer flex items-center justify-between">
            <div className="flex items-center gap-2">
              {story.tags.length > 0 && (
                <div className="tags-container">
                  {story.tags.map((tag) => (
                    <span
                      key={tag}
                      className="tag-link bg-[#f4f4f4] dark:bg-gray-700 text-[#333] dark:text-gray-300 ml-2"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <span className="read-time text-gray-700 dark:text-gray-400">
                {story.reading_time || "5"} min read
              </span>
            </div>
            <div>
              <button
                onClick={() => handleBookmark(story.id)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <BookmarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StoryList;
