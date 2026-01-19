import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { teamDb, teamMemberDb, prisma } from "@/lib/database";


// Force dynamic rendering (Vercel serverless function)
export const dynamic = 'force-dynamic';

// Tüm kayıtlı takımları getir (kullanıcı takım aramak için kullanır)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    // Tüm takımları getir
    const allTeams = await teamDb.getAll();

    // Kullanıcının mevcut üyeliklerini ve bekleyen isteklerini al
    const userMemberships = await teamMemberDb.findByUserId(session.user.id);
    const userTeamIds = userMemberships.map((m: any) => m.teamId);

    const pendingRequests = await prisma.teamJoinRequest.findMany({
      where: {
        userId: session.user.id,
        status: 'pending'
      }
    });
    const pendingTeamIds = pendingRequests.map((r) => r.teamId);

    // Her takım için detaylı bilgi hazırla
    const teamsWithDetails = await Promise.all(
      allTeams.map(async (team: any) => {
        const members = await teamMemberDb.findByTeamId(team.id);
        
        return {
          id: team.id,
          name: team.name,
          description: team.description,
          teamNumber: team.teamNumber,
          createdAt: team.createdAt,
          memberCount: members.length,
          isMember: userTeamIds.includes(team.id),
          hasPendingRequest: pendingTeamIds.includes(team.id),
        };
      })
    );

    // Takımları üye sayısına göre sırala (en popüler en üstte)
    const sortedTeams = teamsWithDetails.sort((a, b) => b.memberCount - a.memberCount);

    return NextResponse.json({
      teams: sortedTeams,
    });

  } catch (error) {
    console.error("Error fetching all teams:", error);
    return NextResponse.json(
      { error: "Takımlar yüklenirken hata oluştu." },
      { status: 500 }
    );
  }
}

