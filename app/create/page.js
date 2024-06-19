"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TagInput from "@/components/TagInput";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";

const ContentEditor = dynamic(() => import("@/components/ContentEditor"), {
  ssr: false,
});

export default function NewStory() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleContentChange = (newContent) => setContent(newContent);
  const handleTagChange = (newTags) => setTags(newTags);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("User not authenticated");
      setLoading(false);
      return;
    }

    try {
      // Upload image to Firebase Storage
      let mainImageUrl = "";
      if (imageFile) {
        const imageRef = ref(storage, `images/${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        mainImageUrl = await getDownloadURL(imageRef);
      }

      const storyData = {
        title,
        content,
        tags,
        main_image: mainImageUrl,
      };

      const response = await fetch("/api/posts/create-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(storyData),
      });

      if (response.ok) {
        toast.success("Story created successfully");
        router.push("/");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to create story");
      }
    } catch (err) {
      toast.error("An error occurred while creating the story");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-8 mt-6">
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
          <Label className="block mb-2" htmlFor="mainImage">
            Main Image
          </Label>
          <Input
            id="mainImage"
            type="file"
            accept="image/*"
            
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </div>
        <ContentEditor content={content} onChange={handleContentChange} />
        <TagInput tags={tags} onChange={handleTagChange} />

        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : "Create story"}
        </Button>
      </form>
    </div>
  );
}
