// app/stories/[id]/page.js
import { notFound } from "next/navigation";
import pool from "@/lib/db";
import Image from "next/image";
import { format } from "date-fns";
import DOMPurify from "isomorphic-dompurify";
import ClientSideHighlight from "./ClientSideHighlight";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const { rows } = await pool.query("SELECT id FROM stories");
  return rows.map((row) => ({
    id: row.id.toString(),
  }));
}

async function getStory(id) {
  const { rows } = await pool.query(
    "SELECT title, subtitle, author, content, tags, reading_time, created_at, links, main_image FROM stories WHERE id = $1",
    [id],
  );

  if (rows.length === 0) {
    return null;
  }

  return rows[0];
}

export default async function Story({ params }) {
  const story = await getStory(params.id);

  if (!story) {
    notFound();
  }

  const sanitizedContent = DOMPurify.sanitize(story.content);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="mb-3 mt-2 text-left text-2xl tracking-tight dark:text-white lg:text-4xl lg:leading-snug font-bold">
        {story.title}
      </h1>
      <div className="mt-3 flex space-x-3 text-gray-500 ">
        <div className="flex items-center gap-3">
          {story.author[0].avatarUrl && (
            <div className="relative h-12 w-12 overflow-hidden rounded-full flex-shrink-0">
              <Image
                src={story.author[0].avatarUrl}
                alt={story.author[0].name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div>
            <div className="flex">
              <p className="text-gray-800 dark:text-gray-400">
                <span>{story.author[0].name}</span>
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="post-date text-sm text-gray-500 dark:text-gray-300">
                <time dateTime={story.created_at}>
                  {format(new Date(story.created_at), "MMMM d, yyyy")}
                </time>
              </span>
              <span className="flex items-center gap-1">
                · {story.reading_time} min read
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="relative mx-auto mt-4 aspect-video max-w-screen-md overflow-hidden rounded-md md:mx-auto lg:rounded-lg">
        <Image
          src={story.main_image}
          alt={story.title}
          priority
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="prose prose-lg mx-auto my-3 text-base dark:prose-invert prose-a:text-blue-500 md:text-xl">
        <ClientSideHighlight content={sanitizedContent} />
      </div>
      <div>
        {story.tags.map((tag, index) => (
          <span
            key={index}
            className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full mr-2"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}