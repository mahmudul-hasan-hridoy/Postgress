"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Link2, Search, Bell, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    router.push("/auth/login");
  };

  return (
    <header className="flex h-16 w-full items-center justify-between px-4 md:px-6 border-b">
      <Link className="flex items-center gap-2" href="/">
        <Link2 className="h-6 w-6" />
        <span className="text-lg font-semibold">URL Shortener</span>
      </Link>

      <div className="flex items-center gap-4">
        <div className="hidden md:block w-72">
          <Input type="text" placeholder="Search..." />
        </div>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage
                src={user?.avatarUrl || "placeholder-user.jpg"}
                alt={user?.name}
              />
              <AvatarFallback>{user?.name?.charAt(0) || "G"}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 md:w-72">
            <DropdownMenuItem asChild>
              <Link href="/">Home</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="#">Shorten</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="#">Contact</Link>
            </DropdownMenuItem>

            {isLoggedIn && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/create">Create</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/me/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/me/stories">Stories</Link>
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuSeparator />

            {isLoggedIn ? (
              <>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/auth/login" className="w-full">
                    <Button variant="outline" className="w-full justify-center">
                      Log in
                    </Button>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/auth/register" className="w-full">
                    <Button className="w-full justify-center">Register</Button>
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
