"use client";
import { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Clipboard, ClipboardCheck } from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
      toast.success("URL shortened successfully!");
    } catch (error) {
      toast.error(error.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    setIsCopied(true);
    toast.success("URL copied to clipboard!");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <main className="flex-1 py-12 px-6 md:px-8 max-w-xl mx-auto space-y-8">
        <div className="max-w-md w-full">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-800">
              Shorten your links with ease
            </h1>
            <p className="text-gray-600 text-lg">
              Simplify your online presence with our powerful URL shortener.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex mb-6 flex-col gap-3 mt-4">
            <Input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter the long URL"
              required
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md"
              disabled={isLoading}
            >
              {isLoading ? "Shortening..." : "Shorten"}
            </Button>
          </form>
          {shortUrl && (
            <div className="mt-6 flex items-center justify-between">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {shortUrl}
              </a>
              <CopyToClipboard text={shortUrl} onCopy={handleCopy}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center justify-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  {isCopied ? (
                    <>
                      <ClipboardCheck className="mr-2 h-4 w-4" /> Copied!
                    </>
                  ) : (
                    <>
                      <Clipboard className="mr-2 h-4 w-4" /> Copy URL
                    </>
                  )}
                </Button>
              </CopyToClipboard>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
