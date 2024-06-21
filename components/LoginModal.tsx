import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { generateAvatar } from "@/lib/avatar";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleGoogleSignUp: () => void;
  handleGitHubLogin: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  handleGoogleSignUp,
  handleGitHubLogin,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleEmailSubmit = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      const response = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.exists) {
          setIsNewUser(false);
          setShowVerificationInput(true);
          toast.success("A verification code has been sent to your email.");
        } else {
          setIsNewUser(true);
          setShowPasswordInput(true);
        }
      } else {
        toast.error(data.message || "An error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Error during email check:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const handleVerification = async () => {
    if (!verificationCode) {
      toast.error("Please enter the verification code");
      return;
    }

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, verificationCode }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/m/callback/email?token=" + data.token);
      } else {
        toast.error(
          data.message || "Invalid verification code. Please try again.",
        );
      }
    } catch (error) {
      console.error("Error during verification:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const handleSignUp = async () => {
    if (!name) {
      toast.error("Please enter your name");
      return;
    }

    if (!password) {
      toast.error("Please enter a password");
      return;
    }

    try {
const avatarUrl = generateAvatar();
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name,avatarUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/m/callback/email?token=" + data.token);
      } else {
        toast.error(
          data.message || "An error occurred during sign up. Please try again.",
        );
      }
    } catch (error) {
      console.error("Error during sign up:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed h-screen inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md h-screen flex flex-col items-center justify-center relative"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-serif">Join Medium.</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 absolute top-5 right-5"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="space-y-4 w-full">
          {!showEmailInput ? (
            <>
              <Button
                variant="outline"
                className="w-full justify-center space-x-2"
                onClick={handleGoogleSignUp}
              >
                <FcGoogle size={24} />
                <span>Sign up with Google</span>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-center space-x-2"
                onClick={handleGitHubLogin}
              >
                <FaGithub size={24} />
                <span>Sign up with Github</span>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-center space-x-2"
                onClick={() => setShowEmailInput(true)}
              >
                <Mail className="w-5 h-5" />
                <span>Sign up with email</span>
              </Button>
            </>
          ) : showVerificationInput ? (
            <>
              <Label htmlFor="verification">Verification Code</Label>
              <Input
                id="verification"
                type="text"
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              <Button
                className="w-full justify-center"
                onClick={handleVerification}
              >
                Verify
              </Button>
            </>
          ) : showPasswordInput ? (
            <>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Label htmlFor="password">Create Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button className="w-full justify-center" onClick={handleSignUp}>
                Sign Up
              </Button>
            </>
          ) : (
            <>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                className="w-full justify-center"
                onClick={handleEmailSubmit}
              >
                Continue
              </Button>
              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={() => setShowEmailInput(false)}
              >
                Back
              </Button>
            </>
          )}
        </div>
        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <button className="text-green-600 hover:underline">Sign in</button>
        </div>
        <div className="mt-4 text-center text-xs text-gray-500">
          Click "Sign up" to agree to Medium's Terms of Service and acknowledge
          that Medium's Privacy Policy applies to you.
        </div>
      </div>
    </div>
  );
};

export default LoginModal;