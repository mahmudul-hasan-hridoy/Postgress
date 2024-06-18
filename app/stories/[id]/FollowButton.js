"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { verifyToken } from "@/lib/auth";

const FollowButton = ({ authorId, initialIsFollowing }) => {
 const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
 const [userId, setUserId] = useState(null);

 useEffect(() => {
   const token = localStorage.getItem("token");
   const decodedToken = verifyToken(token);

   if (decodedToken) {
     setUserId(decodedToken.id);
   }
 }, []);

 const handleFollow = async () => {
   try {
     const response = await axios.post("/api/follow", {
       userId,
       authorId,
     });

     if (response.status === 200) {
       setIsFollowing(true);
     }
   } catch (error) {
     console.error("Error following user:", error);
     // Handle error
   }
 };

 return (
   <button
     onClick={handleFollow}
     disabled={isFollowing || !userId}
     className="ml-3 text-green-800"
   >
     {isFollowing ? "Following" : "Follow"}
   </button>
 );
};

export default FollowButton;