"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaUserCircle } from "react-icons/fa";

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
          console.log(res.statusText);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <FaUserCircle className="mx-auto text-6xl text-gray-400" />
          <p className="mt-4">You are not authorized to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-lg w-full">
        <div className="flex items-center space-x-4">
          {user.avatarUrl ? (
            <div className="w-16 h-16 relative rounded-full overflow-hidden">
              <Image
                src={user.avatarUrl}
                alt="User Avatar"
                layout="fill"
                objectFit="cover"
              />
            </div>
          ) : (
            <FaUserCircle className="w-16 h-16 text-gray-400" />
          )}
          <div>
            <h2 className="text-2xl font-semibold">{user.name}</h2>
            <p className="text-gray-500">@{user.username}</p>
          </div>
        </div>
        <div className="mt-6">
          <p className="text-lg">
            <strong>Email:</strong> {user.email}
          </p>
          {user.bio && (
            <p className="mt-4">
              <strong>Bio:</strong> {user.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
