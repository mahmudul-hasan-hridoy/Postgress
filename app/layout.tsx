import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});

export const metadata: Metadata = {
  title: "Medium clone",
  description: "Like medium",
};

export default function Layout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(inter.variable, lora.variable, "scroll-smooth")}
    >
      <script src="https://apis.google.com/js/platform.js" async defer></script>
      <body className="mx-auto max-w-screen-lg overflow-x-hidden bg-background font-sans antialiased">
        <Toaster closeButton expand={false} richColors position="top-center" />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}

export const revalidate = 60;
