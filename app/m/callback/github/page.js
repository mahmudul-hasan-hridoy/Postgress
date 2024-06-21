"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const GithubCallbackPage = () => {
  const router = useRouter();
  const [status, setStatus] = useState("Processing");

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");
    const error = url.searchParams.get("error");
    const exist = url.searchParams.get("exist");
    const isNewUser = url.searchParams.get("isNewUser") === "true";

    if (token) {
      localStorage.setItem("token", token);
      setStatus(isNewUser ? "New Account Created" : "Login Successful");
      setTimeout(() => router.push("/"), 3000);
    } else if (exist) {
      setStatus("Account Exists");
      toast.error(exist);
      setTimeout(() => router.push("/"), 3000);
    } else if (error) {
      setStatus("Authentication Failed");
      console.error(error);
      toast.error(error);
      setTimeout(() => router.push("/"), 3000);
    } else {
      setStatus("Unknown Error");
      toast.error("An unknown error occurred");
      setTimeout(() => router.push("/"), 3000);
    }
  }, [router]);

  const statusMessages = {
    Processing: "Processing your authentication...",
    "New Account Created": "Your account has been created successfully!",
    "Login Successful": "You have successfully logged in.",
    "Account Exists": "An account with this email already exists.",
    "Authentication Failed": "We couldn't authenticate you. Please try again.",
    "Unknown Error": "An unexpected error occurred. Please try again later.",
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">{status}</h1>
      <p className="text-lg mb-4 text-center">{statusMessages[status]}</p>
      <p className="text-md mb-4 text-center">Redirecting you shortly...</p>
      <img
        src="/1_q_dy5SuRV1491Ldw_TQzDQ.gif"
        alt="Loading..."
        className="w-64 h-64"
      />
    </div>
  );
};

export default GithubCallbackPage;
