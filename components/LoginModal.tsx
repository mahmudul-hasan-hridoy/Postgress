import React, { useEffect, useRef, useState } from "react";
import { X, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { generateAvatar } from "@/lib/avatar";
import { motion, AnimatePresence } from "framer-motion";

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
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [showNamePasswordInput, setShowNamePasswordInput] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
        setShowVerificationInput(true);
        setIsNewUser(!data.exists);
        toast.success("A verification code has been sent to your email.");
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
        if (isNewUser) {
          setShowNamePasswordInput(true);
          setShowVerificationInput(false);
        } else {
          router.push("/m/callback/email?token=" + data.token);
        }
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
        body: JSON.stringify({ email, password, name, avatarUrl }),
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md h-screen flex flex-col items-center justify-center relative"
          >
            <button
              onClick={onClose}
              className="absolute top-10 right-6 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-3xl font-serif mb-6">Join Medium</h2>
            <AnimatePresence mode="wait">
              {!showEmailInput ? (
                <motion.div
                  key="initial"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4 w-full"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-center space-x-2 py-6 text-lg transition-all hover:bg-gray-100"
                    onClick={handleGoogleSignUp}
                  >
                    <FcGoogle size={24} />
                    <span>Sign up with Google</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-center space-x-2 py-6 text-lg transition-all hover:bg-gray-100"
                    onClick={handleGitHubLogin}
                  >
                    <FaGithub size={24} />
                    <span>Sign up with GitHub</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-center space-x-2 py-6 text-lg transition-all hover:bg-gray-100"
                    onClick={() => setShowEmailInput(true)}
                  >
                    <Mail className="w-5 h-5" />
                    <span>Sign up with email</span>
                  </Button>
                </motion.div>
              ) : showVerificationInput ? (
                <motion.div
                  key="verification"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4 w-full"
                >
                  <h3 className="text-xl font-serif font-semibold">
                    Check your inbox
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Enter the code we sent to {email} to{" "}
                    {isNewUser ? "sign up" : "sign in"}.
                  </p>

                  <Input
                    id="verification"
                    type="text"
                    placeholder="Enter verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="py-6 text-lg"
                  />
                  <Button
                    className="w-full justify-center py-6 text-lg bg-black text-white hover:bg-gray-800 transition-colors"
                    onClick={handleVerification}
                  >
                    Verify
                  </Button>
                </motion.div>
              ) : showNamePasswordInput ? (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4 w-full"
                >
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="py-6 text-lg"
                  />

                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="py-6 text-lg pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <Button
                    className="w-full justify-center py-6 text-lg bg-black text-white hover:bg-gray-800 transition-colors"
                    onClick={handleSignUp}
                  >
                    Sign Up
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4 w-full"
                >
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="py-6 text-lg"
                  />
                  <Button
                    className="w-full justify-center py-6 text-lg bg-black text-white hover:bg-gray-800 transition-colors"
                    onClick={handleEmailSubmit}
                  >
                    Continue
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-center py-6 text-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setShowEmailInput(false)}
                  >
                    Back
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="mt-6 text-center text-sm text-gray-500">
              {showEmailInput
                ? "Already have an account? "
                : "Don't have an account? "}
              <button className="text-green-600 hover:underline font-semibold">
                {showEmailInput ? "Sign in" : "Sign up"}
              </button>
            </div>
            <div className="mt-4 text-center text-xs text-gray-500">
              By clicking "Continue", you agree to our{" "}
              <a href="#" className="underline">
                Terms of Service
              </a>{" "}
              and acknowledge that our{" "}
              <a href="#" className="underline">
                Privacy Policy
              </a>{" "}
              applies to you.
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
