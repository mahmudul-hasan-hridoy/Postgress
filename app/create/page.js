"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TagInput from "@/components/TagInput";
import PublicationSelect from "@/components/PublicationSelect";
import { toast } from "sonner";

const ContentEditor = dynamic(() => import("@/components/ContentEditor"), {
  ssr: false,
});

export default function NewStory() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [publicationId, setPublicationId] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleContentChange = (newContent) => setContent(newContent);
  const handleTagChange = (newTags) => setTags(newTags);
  const handlePublicationChange = (newPublicationId) =>
    setPublicationId(newPublicationId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("User not authenticated");
      return;
    }
    const storyData = {
      title,
      subtitle,
      content,
      tags,
      publicationId,
    };
    try {
      const response = await fetch("/api/stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(storyData),
      });
      if (response.ok) {
        router.push("/"); // Redirect to homepage or the new story's page
      } else {
        const errorData = await response.json();
        toast.error(errorData.message);
      }
    } catch (err) {
      toast.error("An error occurred while creating the story");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <Label className="block mb-2" htmlFor="title">
            Title
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <Label className="block mb-2" htmlFor="subtitle">
            Subtitle
          </Label>
          <Input
            id="subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
        </div>
        <ContentEditor content={content} onChange={handleContentChange} />
        <TagInput tags={tags} onChange={handleTagChange} />
        <Button type="submit" className="w-full">
          Create Story
        </Button>
      </form>
    </div>
  );
}
