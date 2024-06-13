// app/api/stories/get-stories/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export const GET = async (req: NextRequest) => {
  try {
    const { rows } = await pool.query("SELECT * FROM stories ORDER BY created_at DESC");
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error fetching stories" }, { status: 500 });
  }
};