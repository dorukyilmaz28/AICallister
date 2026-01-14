import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/database";

// GET /api/dashboard/stats - Get user dashboard statistics
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get conversation stats
    const totalConversations = await prisma.conversation.count({
      where: { userId },
    });

    const totalMessages = await prisma.message.count({
      where: {
        conversation: {
          userId,
        },
      },
    });

    // Get code snippet stats
    const totalCodeSnippets = await prisma.codeSnippet.count({
      where: { userId },
    });

    const favoriteSnippets = await prisma.userFavoriteSnippet.count({
      where: { userId },
    });

    // Get team stats
    const teamMembership = await prisma.teamMember.findFirst({
      where: {
        userId,
        status: "approved",
      },
      include: {
        team: {
          include: {
            _count: {
              select: {
                members: {
                  where: { status: "approved" },
                },
              },
            },
          },
        },
      },
    });

    const teamMembers = teamMembership?.team?._count?.members || 0;
    const teamRole = teamMembership?.role || "member";

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentConversations = await prisma.conversation.findMany({
      where: {
        userId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
    });

    const recentSnippets = await prisma.codeSnippet.findMany({
      where: {
        userId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
    });

    const recentActivity = [
      ...recentConversations.map((c) => ({
        type: "conversation",
        title: c.title || "Konuşma",
        date: c.createdAt.toISOString(),
      })),
      ...recentSnippets.map((s) => ({
        type: "snippet",
        title: s.title,
        date: s.createdAt.toISOString(),
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // Get weekly activity (last 7 days)
    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const conversations = await prisma.conversation.count({
        where: {
          userId,
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
      });

      const snippets = await prisma.codeSnippet.count({
        where: {
          userId,
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
      });

      weeklyActivity.push({
        date: date.toISOString(),
        conversations,
        snippets,
      });
    }

    return NextResponse.json({
      totalConversations,
      totalMessages,
      totalCodeSnippets,
      favoriteSnippets,
      teamMembers,
      teamRole,
      recentActivity,
      weeklyActivity,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Dashboard verileri yüklenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

