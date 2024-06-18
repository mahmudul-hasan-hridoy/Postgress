"use client";
import { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Clipboard, ClipboardCheck } from "lucide-react";
import Cookies from "js-cookie";

export default function Home() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState(() => {
    const storedHistory = Cookies.get("urlHistory");
    return storedHistory ? JSON.parse(storedHistory) : [];
  });
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to shorten URL");
      }

      const data = await response.json();
      setShortUrl(data.shortUrl);
      const newHistory = [
        ...history,
        { originalUrl: url, shortenedUrl: data.shortUrl },
      ];
      setHistory(newHistory);
      Cookies.set("urlHistory", JSON.stringify(newHistory), { expires: 365 });
      setUrl("");
    } catch (error) {
      toast.error(error.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="py-12 md:px-8">
        <div className="container md:mx-auto max-w-xl space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-800">
              Shorten your links with ease
            </h1>
            <p className="text-gray-600 text-lg">
              Simplify your online presence with our powerful URL shortener.
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex mb-6 flex-col gap-3 mt-4"
          >
            <Input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/very-long-url"
              required
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Shortening..." : "Shorten"}
            </Button>
          </form>
          {shortUrl && (
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
              <h2 className="text-lg font-bold mb-2">Your Shortened URL</h2>
              <div className="flex items-center justify-between">
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  {shortUrl}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(shortUrl)}
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
