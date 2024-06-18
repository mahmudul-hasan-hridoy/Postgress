// components/StoryList.tsx
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { Bookmark } from "lucide-react";

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
  main_image: string;
  links: object;
}

const StoryList: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch("/api/stories/get-stories");
        const data = await response.json();
        setStories(data);
      } catch (error) {
        console.error("Error fetching stories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  const handleBookmark = async (storyId: string) => {
    console.log("Bookmark clicked for story:", storyId);
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
      {stories.map((story) => (
        <div key={story.id} className="p-4 border-b">
          <div className="flex items-center mb-2">
            <div>
              {story.author[0].avatarUrl && (
                <div className="relative h-6 w-6 overflow-hidden rounded-full flex-shrink-0">
                  <Image
                    src={story.author[0].avatarUrl}
                    alt={story.author[0].name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
            <div className="ml-2">
              <span className="author-name font-medium text-gray-500 dark:text-gray-300">
                {story.author[0].name}
              </span>
              <span className="text-gray-500 dark:text-gray-300 mx-2">·</span>
              <span className="post-date text-sm text-gray-500 dark:text-gray-300">
                <time dateTime={story.created_at}>
                  {format(new Date(story.created_at), "MMMM d, yyyy")}
                </time>
              </span>
            </div>
          </div>

          <div className="flex">
            <div className="flex-1">
              <h2 className="blog-item-title font-bold line-clamp-2 text-ellipsis text-xl">
                <Link href={`/stories/${story.id}`}>{story.title}</Link>
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 text-ellipsis">
                {story.subtitle}
              </p>
              <div className="mt-2 flex items-center">
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
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  {story.reading_time} min read
                </span>
              </div>
            </div>
            {story.main_image && (
              <div className="ml-4 w-[100px] h-[100px] relative">
                <Link href={`/stories/${story.id}`}>
                  <Image
                    src={story.main_image}
                    alt={story.title}
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
              onClick={() => handleBookmark(story.id)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Bookmark className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <div className="flex items-center">
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {story.claps} claps
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-sm ml-4">
                {story.responses} responses
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StoryList;
