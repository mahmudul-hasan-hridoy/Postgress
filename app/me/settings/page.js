"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [initialValues, setInitialValues] = useState({});

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
            setName(userData.name);
            setUsername(userData.username);
            setEmail(userData.email);
            setAvatarUrl(userData.avatarUrl);
            setInitialValues({
              name: userData.name,
              username: userData.username,
              email: userData.email,
              avatarUrl: userData.avatarUrl,
            });
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
        body: JSON.stringify({ name, username, email, avatarUrl }),
      });
      if (res.ok) {
        toast.success("Profile updated successfully");
        setInitialValues({ name, username, email, avatarUrl });
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

  const hasChanges = () => {
    return (
      name !== initialValues.name ||
      username !== initialValues.username ||
      email !== initialValues.email ||
      avatarUrl !== initialValues.avatarUrl
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 dark:bg-gray-950">
        <div className="flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 dark:bg-gray-950">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your account settings.
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-700 dark:text-gray-200">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Label
              htmlFor="username"
              className="text-gray-700 dark:text-gray-200"
            >
              Username
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-gray-700 dark:text-gray-200">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Label
              htmlFor="avatarUrl"
              className="text-gray-700 dark:text-gray-200"
            >
              Profile Picture
            </Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback>{name.charAt(0)}</AvatarFallback>
              </Avatar>
              <Input
                id="avatarUrl"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <Button
            onClick={handleUpdateProfile}
            disabled={!hasChanges()}
            className={`mt-4 w-full rounded-md py-2 px-4 font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              hasChanges()
                ? "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700"
                : "bg-gray-500 cursor-not-allowed"
            }`}
          >
            Update Profile
          </Button>
        </div>
        <div className="mt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Want to delete your account?
          </p>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            className="mt-2 w-full rounded-md bg-red-500 py-2 px-4 font-semibold text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-600 dark:hover:bg-red-700"
          >
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
