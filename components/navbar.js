"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Search, Bell, LogOut } from "lucide-react";
import Logo from "@/components/logo";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (typeof window !== "undefined") {
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
              setIsLoggedIn(true);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [typeof window !== "undefined" && localStorage.getItem("token")]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    setUser(null);
    setIsLoggedIn(false);
  };

  const handleSearchClick = () => {
    router.push("/search");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="flex h-16 w-full items-center justify-between px-4 md:px-6 border-b bg-white">
      <Link className="flex items-center gap-2" href="/">
        <Logo className="h-6 fill-current" />
      </Link>

      <div className="flex items-center gap-4">
        <div className="hidden md:block w-72">
          <Input type="text" placeholder="Search..." className="w-full" />
        </div>
        <button
          className="md:hidden text-black/60 hover:text-black"
          onClick={handleSearchClick}
        >
          <Search className="h-5 w-5" />
        </button>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>

        <div className="relative">
          <div className="cursor-pointer" onClick={toggleDropdown}>
            <Avatar>
              <AvatarImage
                src={user?.avatarUrl || "/placeholder-user.jpg"}
                alt={user?.name}
              />
              <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
          </div>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-md bg-white shadow-lg z-50 border px-2">
              <div className="py-2">
                {/* Dropdown items */}
                <Link
                  href="/"
                  className="block px-4 py-2 text-sm md:text-lg text-gray-700 hover:bg-gray-100 rounded"
                >
                  Home
                </Link>
                <Link
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  Shorten
                </Link>
                <Link
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  Contact
                </Link>
                {isLoggedIn && (
                  <>
                    <div className="border-b border-gray-200 my-1" />
                    <Link
                      href="/create"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      Create
                    </Link>
                    <Link
                      href="/me/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      Settings
                    </Link>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/me/stories"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      Stories
                    </Link>
                  </>
                )}
                <div className="border-b border-gray-200 mt-1" />
                {isLoggedIn ? (
                  <>
                    <div className="px-4 py-2">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.name}
                        </p>
                        <p className="text-xs leading-none text-gray-500">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center w-full rounded"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="block px-4 py-2 text-sm text-gray-700"
                    >
                      <button
                        variant="outline"
                        className="w-full justify-center rounded-md bg-white py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border"
                      >
                        Log in
                      </button>
                    </Link>
                    <Link
                      href="/auth/register"
                      className="block px-4 py-2 text-sm text-gray-700"
                    >
                      <button className="w-full justify-center rounded-md bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        Register
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
