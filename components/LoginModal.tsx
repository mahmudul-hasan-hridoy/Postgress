import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

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
            className="text-gray-500 hover:text-gray-700 absolute top-10 right-10"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="space-y-4">
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
            className="w-full justify-start space-x-2"
            onClick={handleGitHubLogin}
          >
            <FaGithub size={24} />
            <span>Sign up with Github</span>
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start space-x-2"
            onClick={() => onLogin("email")}
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span>Sign up with email</span>
          </Button>
        </div>
        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <button
            className="text-green-600 hover:underline"
            onClick={() => onLogin("signin")}
          >
            Sign in
          </button>
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
