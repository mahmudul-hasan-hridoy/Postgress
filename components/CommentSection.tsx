import React, { useState, useEffect } from "react";
import { parseISO, format } from "date-fns";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import { EllipsisVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoginModal from "./LoginModal";
import { getGoogleAuthUrl } from "@/lib/google-auth";

interface Comment {
  id: number;
  content: string;
  author: {
    id: number;
    name: string;
  };
  createdAt: string;
}

interface CommentSectionProps {
  comments: Comment[];
  postId: number;
  onCommentSubmit: (newComment: Comment) => void;
  onDeleteComment: (commentId: number) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  postId,
  onCommentSubmit,
  onDeleteComment,
}) => {
  const [comment, setComment] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken: { id: number } = jwtDecode(token);
      setUserId(decodedToken.id);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleCommentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: comment }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const newComment = await response.json();
      onCommentSubmit(newComment);
      setComment("");
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `/api/posts/${postId}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete comment");
      }

      onDeleteComment(commentId);
      toast.success("Comment deleted successfully");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  const handleLogin = () => {
    setIsLoginModalOpen(true);
  };

  const handleGoogleSignUp = async () => {
    try {
      const googleAuthUrl = await getGoogleAuthUrl();
      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error("Error getting Google auth URL:", error);
      toast.error("An error occurred while signing up with Google.");
    }
  };

  const handleGitHubLogin = () => {
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/github/callback`;
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const scope = "user:email";
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    window.location.href = authUrl;
  };

  return (
    <div className="comments">
      <h2 className="text-xl font-bold mb-2">Comments</h2>
      {isLoggedIn ? (
        <form onSubmit={handleCommentSubmit} className="mb-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            rows={4}
            placeholder="Write a comment..."
            required
          />
          <button
            type="submit"
            className="w-full mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Comment
          </button>
        </form>
      ) : (
        <div className="mb-4">
          <Button onClick={handleLogin} className="w-full">
            Login to Comment
          </Button>
        </div>
      )}
      {comments.length === 0 && <p className="text-center">No comments yet.</p>}
      {comments.length > 0 &&
        comments.map((comment) => (
          <div
            key={comment.id}
            className="border border-gray-200 rounded-md p-3 mb-2 relative"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-400 mt-1">
                  {comment.author.name} on{" "}
                  <time dateTime={comment.createdAt}>
                    {format(parseISO(comment.createdAt), "MMMM d, yyyy")}
                  </time>
                </p>
                <p className="text-gray-600">{comment.content}</p>
              </div>
              <div>
                <button
                  onClick={() =>
                    setDropdownOpen(
                      dropdownOpen === comment.id ? null : comment.id,
                    )
                  }
                  className="relative z-10"
                >
                  <EllipsisVertical className="w-4 h-4" />
                </button>
                {dropdownOpen === comment.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-20">
                    <button
                      onClick={() => {
                        toast.success("Reported successfully");
                        setDropdownOpen(null);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Report
                    </button>
                    {userId && comment.author.id === userId && (
                      <button
                        onClick={() => {
                          handleDeleteComment(comment.id);
                          setDropdownOpen(null);
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-gray-100"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        handleGoogleSignUp={handleGoogleSignUp}
        handleGitHubLogin={handleGitHubLogin}
      />
    </div>
  );
};

export default CommentSection;
