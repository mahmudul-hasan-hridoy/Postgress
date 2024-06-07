"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const res = await fetch("/api/user/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
            setUsername(userData.username);
            setEmail(userData.email);
            setAvatarUrl(userData.avatarUrl);
          } else {
            toast.error("Failed to fetch user data");
          }
        } else {
          router.push("/auth/login");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("An error occurred while fetching user data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [router]);

  const handleUpdateProfile = async () => {
    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ username, email, avatarUrl }),
      });
      if (res.ok) {
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating your profile.");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const confirmed = window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      );
      if (confirmed) {
        const res = await fetch("/api/user/delete", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.ok) {
          toast.success("Account deleted successfully");
          localStorage.removeItem("token");
          router.push("/auth/login");
        } else {
          toast.error("Failed to delete account");
        }
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("An error occurred while deleting your account.");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gray-100 px-4 py-12 dark:bg-gray-950">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your account settings.
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="avatarUrl">Profile Picture</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatarUrl} alt={username} />
                <AvatarFallback>{username.charAt(0)}</AvatarFallback>
              </Avatar>
              <Input
                id="avatarUrl"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleUpdateProfile}>Update Profile</Button>
        </div>
        <div className="space-y-2 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Want to delete your account?
          </p>
          <Button variant="destructive" onClick={handleDeleteAccount}>
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
