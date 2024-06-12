"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function Create() {
  const [url, setUrl] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [history, setHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`,
        {
          method: "GET",
        },
      );
      const data = await response.json();
      setShortenedUrl(data.shorturl);
      setHistory([
        ...history,
        { originalUrl: url, shortenedUrl: data.shorturl },
      ]);
      setUrl("");
    } catch (error) {
      console.error("Error shortening URL:", error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="py-12 md:px-8">
        <div className="container mx-auto max-w-xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Shorten Your URL</h1>
            <p className="text-gray-500">
              Enter a long URL and we'll generate a short, easy-to-share link.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="url">Long URL</Label>
              <Input
                type="url"
                id="url"
                placeholder="https://example.com/very-long-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Shorten URL
            </Button>
          </form>
          {shortenedUrl && (
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
              <h2 className="text-lg font-bold mb-2">Your Shortened URL</h2>
              <div className="flex items-center justify-between">
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  {shortenedUrl}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(shortenedUrl)}
                >
                  Copy
                </Button>
              </div>
            </div>
          )}
          {history.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">History</h2>
              <div className="space-y-4">
                {history.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <p className="text-gray-900 dark:text-gray-100 font-medium">
                        {item.originalUrl}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {item.shortenedUrl}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(item.shortenedUrl)}
                    >
                      Copy
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
