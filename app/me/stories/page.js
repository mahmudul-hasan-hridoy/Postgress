"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import StoryCard from "@/components/StoryCard";

export default function Stories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("User not authenticated");
          return;
        }

        const response = await fetch("/api/stories", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStories(data.stories);
        } else {
          const errorData = await response.json();
          toast.error(errorData.message);
        }
      } catch (err) {
        toast.error("An error occurred while fetching stories");
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  const handleDeleteStory = async (storyId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("User not authenticated");
        return;
      }

      const response = await fetch(`/api/stories/${storyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setStories(stories.filter((story) => story.id !== storyId));
        toast.success("Story deleted successfully");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message);
      }
    } catch (err) {
      toast.error("An error occurred while deleting the story");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Your Stories</h1>
      {loading ? (
        <p>Loading...</p>
      ) : stories.length === 0 ? (
        <p>You haven't created any stories yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onDelete={() => handleDeleteStory(story.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}