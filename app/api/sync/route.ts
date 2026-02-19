import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { syncUserProjects } from "@/lib/gitlab/sync";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncUserProjects(session.user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Manual sync failed:", error);
    return NextResponse.json(
      { error: "Sync failed" },
      { status: 500 }
    );
  }
}
