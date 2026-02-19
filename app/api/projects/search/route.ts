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
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Project search failed:", message);

    // Surface token-related errors as 401 so the user knows to re-authenticate
    if (
      message.includes("Token expired") ||
      message.includes("Token refresh failed") ||
      message.includes("No GitLab account found") ||
      message.includes("401")
    ) {
      return NextResponse.json(
        { error: "GitLab token expired — please sign out and sign back in" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: `Failed to search projects: ${message}` },
      { status: 500 }
    );
  }
}
