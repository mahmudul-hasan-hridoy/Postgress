"use server";
import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.SITE_URL}/api/auth/google/callback`,
);

export async function getAuthUrl() {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ],
    });
    return authUrl;
  } catch (error) {
    console.error("Error generating auth URL:", error);
    throw new Error("Failed to generate auth URL");
  }
}
