"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { SheetTrigger, SheetContent, Sheet } from "@/components/ui/sheet";
import { Link2, AlignJustify, LogOut } from "lucide-react";
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
      <nav className="hidden items-center gap-4 md:flex">
        <Link
          className="text-sm font-medium hover:underline hover:underline-offset-4"
          href="/"
        >
          Home
        </Link>
        <Link
          className="text-sm font-medium hover:underline hover:underline-offset-4"
          href="#"
        >
          Shorten
        </Link>
        <Link
          className="text-sm font-medium hover:underline hover:underline-offset-4"
          href="#"
        >
          Contact
        </Link>
        {isLoggedIn && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar>
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="px-4 py-2 text-sm text-gray-700">
                  {user.name}
                </div>
                <div className="px-4 py-2 text-sm text-gray-700">
                  {user.email}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button className="md:hidden" size="icon" variant="outline">
            <AlignJustify className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="flex flex-col justify-between">
          <div className="grid gap-4 p-4">
            <Link
              className="flex items-center gap-2 text-sm font-medium hover:underline hover:underline-offset-4"
              href="/"
            >
              Home
            </Link>
            <Link
              className="flex items-center gap-2 text-sm font-medium hover:underline hover:underline-offset-4"
              href="#"
            >
              Shorten
            </Link>
            <Link
              className="flex items-center gap-2 text-sm font-medium hover:underline hover:underline-offset-4"
              href="#"
            >
              Contact
            </Link>
          </div>
          <div className="grid gap-2 border-t pt-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex-col flex">
                  <span className="font-semibold">{user.name}</span>
                  <span className="text-sm opacity-50">{user.email}</span>
                </div>

                <div className="w-10 h-10">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleLogout}
                    className="text-sm font-medium w-full h-full"
                  >
                    <LogOut className="w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="text-sm font-medium w-full"
                  asChild
                >
                  <Link href="/auth/login" className="w-full">
                    Login
                  </Link>
                </Button>
                <Button className="text-sm font-medium w-full">
                  <Link href="/auth/register" className="w-full">
                    Register
                  </Link>
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
