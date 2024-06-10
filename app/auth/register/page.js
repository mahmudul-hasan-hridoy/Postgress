"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { getGoogleAuthUrl } from "@/lib/google-auth";

function generateAvatar(name) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const size = 128;
  const fontSize = 64;

  canvas.width = size;
  canvas.height = size;

  // Generate a random background color
  const fillStyle = "#" + Math.floor(Math.random() * 16777215).toString(16);
  console.log("Generated color:", fillStyle);

  context.fillStyle = fillStyle;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Determine the text color based on the background color luminance
  const textColor = getContrastColor(fillStyle);
  context.fillStyle = textColor;
  context.font = `bold ${fontSize}px Arial`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(name.charAt(0).toUpperCase(), size / 2, size / 2);

  return canvas.toDataURL("image/png");
}

function getContrastColor(hex) {
  // Remove the hash at the start if it's there
  hex = hex.replace(/^#/, "");

  // Parse the r, g, b values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate luminance
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

  // Return black or white depending on luminance
  return luminance > 186 ? "#000000" : "#FFFFFF";
}

export default function Signup() {
  const router = useRouter();
  const [name, setname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    }
  }, []);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Generate the profile picture URL
      const avatarUrl = generateAvatar(name);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, avatarUrl }),
      });
      if (res.ok) {
        const { userId } = await res.json();
        toast.success("Sign-up successful! Now verify your email.");
      } else {
        const error = await res.text();
        toast.error(error);
      }
    } catch (error) {
      console.error("Error signing up:", error);
      toast.error("An error occurred while signing up.", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const googleAuthUrl = await getGoogleAuthUrl();
      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error("Error getting Google auth URL:", error);
      toast.error(
        "An error occurred while signing up with Google.",
        error.message,
      );
    }
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    const status = url.searchParams.get("status");
    const message = url.searchParams.get("message");
    const token = url.searchParams.get("token");

    if (status === "success" && message === "signedUpWithGoogle" && token) {
      localStorage.setItem("token", token);
      toast.success("You have successfully Sign up with Google.");
    } else if (message === "signUpFailed") {
      toast.error("Error signing up with Google. Please try again.");
    } else if (message === "usertaken") {
      toast.error("Email already exists with a different provider");
    } else if (message === "missingCode") {
      toast.error("Missing code parameter. Unable to complete Google Sign-Up.");
    } else if (message === "failedToProcess") {
      toast.error("Failed to process Google user.");
    }
  }, []);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gray-100 px-4 py-12 dark:bg-gray-950">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Sign Up</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Create your account to get started.
          </p>
        </div>
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 font-medium"
            onClick={handleGoogleSignUp}
          >
            <FcGoogle size={24} />
            Sign Up with Google
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <span className="h-px w-full bg-gray-300 dark:bg-gray-700"></span>
          <span className="px-4 text-gray-500 dark:text-gray-400">or</span>
          <span className="h-px w-full bg-gray-300 dark:bg-gray-700"></span>
        </div>
        <form className="space-y-4" onSubmit={handleSignUp}>
          <div className="space-y-2">
            <Label htmlFor="name">Username</Label>
            <Input
              type="name"
              id="username"
              placeholder="Enter your username"
              required
              value={name}
              onChange={(e) => setname(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="m@example.com"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              required
              type="password"
              placeholder="Choose a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Sign Up"}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?
          <Link
            className="ml-1 font-medium underline underline-offset-2"
            href="/auth/login"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
