"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { getGoogleAuthUrl } from "@/lib/google-auth";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const userData = await res.json();
        if (userData.email_verified) {
          // User's email is verified, proceed with login
          const { token } = userData;
          localStorage.setItem("token", token);
          toast.success("Login successful!");
          router.push("/dashboard");
        } else {
          // User's email is not verified
          toast.error("Please verify your email address before logging in.");
        }
      } else {
        const error = await res.text();
        toast.error(error);
      }
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error("An error occurred while logging in.", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
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

    if (status === "success" && message === "loginWithGoogle" && token) {
      localStorage.setItem("token", token);
      toast.success("You have successfully logged in with Google.");
    }
  }, []);

  const handleGitHubLogin = () => {
    const redirectUri = `${process.env.SITE_URL}/api/auth/github/callback`;
    const clientId = process.env.GITHUB_CLIENT_ID;
    const scope = "user:email";
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    window.location.href = authUrl;
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gray-100 px-4 py-12 dark:bg-gray-950">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Log In</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Log in to your account to continue.
          </p>
        </div>
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 font-medium"
            onClick={handleGoogleLogin}
          >
            <FcGoogle size={24} />
            Continue with Google
          </Button>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 font-medium"
            onClick={handleGitHubLogin}
          >
            <FaGithub size={24} />
            Continue with GitHub
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <span className="h-px w-full bg-gray-300 dark:bg-gray-700"></span>
          <span className="px-4 text-gray-500 dark:text-gray-400">or</span>
          <span className="h-px w-full bg-gray-300 dark:bg-gray-700"></span>
        </div>
        <form className="space-y-4" onSubmit={handleLogin}>
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Log In"}
          </Button>
        </form>
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?
          <Link
            className="ml-1 font-medium underline underline-offset-2"
            href="/auth/signup"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
