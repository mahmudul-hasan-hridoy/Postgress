import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function StoryCard({ story, onDelete }) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-md p-4",
        "grid grid-rows-[auto,1fr,auto] gap-4",
      )}
    >
      <h2 className="text-xl font-bold mb-2">{story.title}</h2>
      <div className="flex flex-col gap-2">
        {story.main_image && (
          <Image
            src={story.main_image}
            alt={story.title}
            width={500}
            height={300}
            className="rounded-lg object-cover"
          />
        )}
        <p className="text-gray-600">{story.subtitle}</p>
      </div>
      <div className="flex justify-between items-center">
        <a
          href={`/stories/${story.id}`}
          className="text-blue-500 hover:text-blue-700"
        >
          Read More
        </a>
        <Button onClick={onDelete} variant="destructive">
          Delete
        </Button>
      </div>
    </div>
  );
}
