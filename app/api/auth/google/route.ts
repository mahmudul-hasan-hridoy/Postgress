 // api/auth/google/route.ts
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.SITE_URL}/api/auth/google/callback`,
);

let authUrl;
try {
  authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
  });
} catch (error) {
  console.error("Error generating auth URL:", error);
  throw new Error("Failed to generate auth URL");
}

export async function GET(request: NextRequest) {
  try {
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Error redirecting to auth URL:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
