import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.monitoredProject.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { mergeRequests: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { gitlabProjectId, name, nameWithNamespace, webUrl } = body;

  if (!gitlabProjectId || !name || !webUrl) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const project = await prisma.monitoredProject.upsert({
    where: {
      userId_gitlabProjectId: {
        userId: session.user.id,
        gitlabProjectId,
      },
    },
    update: { syncEnabled: true, name, nameWithNamespace, webUrl },
    create: {
      userId: session.user.id,
      gitlabProjectId,
      name,
      nameWithNamespace,
      webUrl,
    },
  });

  return NextResponse.json(project, { status: 201 });
}
