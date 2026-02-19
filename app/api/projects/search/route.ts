import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { searchProjects, getValidToken } from "@/lib/gitlab/client";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = req.nextUrl.searchParams.get("q");
  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const token = await getValidToken(session.user.id);
    const projects = await searchProjects(token, query);
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Project search failed:", error);
    return NextResponse.json(
      { error: "Failed to search projects" },
      { status: 500 }
    );
  }
}
