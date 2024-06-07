"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          toast.error(res.statusText);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("An error occurred while fetching user data.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        You are not authorized to access this page.
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gray-100 px-4 py-12 dark:bg-gray-950">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Welcome to the Dashboard</h1>
        </div>
        <div className="space-y-4">
          <div className="flex justify-center">
            <img
              src={user.avatarUrl}
              alt="Profile Picture"
              className="w-32 h-32 rounded-full"
            />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">User Information</h2>
            <p>
              <span className="font-medium">Username:</span> {user.username}
            </p>
            <p>
              <span className="font-medium">Email:</span> {user.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}