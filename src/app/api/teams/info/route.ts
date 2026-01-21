import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { teamDb, userDb, teamJoinRequestDb, teamMemberDb } from "@/lib/database";


// Force dynamic rendering (Vercel serverless function)
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    
    if (!user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const currentUser = await userDb.findById(user.id);
    
    if (!currentUser) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı." },
        { status: 404 }
      );
    }

    // Kullanıcının gerçek takım üyeliklerini kontrol et (user.teamId yerine)
    let userMemberships = await teamMemberDb.findByUserId(user.id);
    
    // Eğer üyelik yoksa ve user.teamNumber varsa, o takımı bul
    let selectedTeamId = null;
    if (userMemberships.length > 0) {
      if (currentUser.teamNumber && userMemberships.length > 1) {
        // Kullanıcının teamNumber'ına göre doğru takımı bul
        const matchingMember = userMemberships.find((member: any) => 
          member.team?.teamNumber === currentUser.teamNumber
        );
        if (matchingMember) {
          selectedTeamId = matchingMember.teamId;
        } else {
          selectedTeamId = userMemberships[0].teamId;
        }
      } else {
        selectedTeamId = userMemberships[0].teamId;
      }
    } else if (currentUser.teamId) {
      // Fallback: user.teamId kullan (ama bu güvenilir değil)
      selectedTeamId = currentUser.teamId;
    }

    if (!selectedTeamId) {
      return NextResponse.json(
        { error: "Herhangi bir takımda değilsiniz." },
        { status: 404 }
      );
    }

    // Takım bilgilerini al
    const team = await teamDb.findById(selectedTeamId);
    if (!team) {
      return NextResponse.json(
        { error: "Takım bulunamadı." },
        { status: 404 }
      );
    }

    // Takım üyelerini al (onaylanmış üyeler)
    const members = await teamDb.getTeamMembers(selectedTeamId);
    const approvedMembers = members.filter(member => member.status === "approved");

    // Bekleyen katılma isteklerini al
    const joinRequests = await teamJoinRequestDb.findByTeamId(selectedTeamId);
    const pendingRequests = joinRequests.filter(req => req.status === "pending");

    console.log(`[teams/info] Kullanıcı ${user.id}, Takım ${selectedTeamId} (teamNumber: ${team.teamNumber}) için:`);
    console.log(`[teams/info] - ${joinRequests.length} toplam katılma isteği`);
    console.log(`[teams/info] - ${pendingRequests.length} pending istek`);
    console.log(`[teams/info] - ${approvedMembers.length} onaylanmış üye`);
    
    pendingRequests.forEach(req => {
      console.log(`[teams/info] Pending: ${req.user.name || req.user.email} (userId: ${req.user.id})`);
    });

    return NextResponse.json({
      team: {
        id: team.id,
        name: team.name,
        teamNumber: team.teamNumber,
        description: team.description,
        adminId: team.adminId
      },
      currentUser: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        status: currentUser.status
      },
      approvedMembers: approvedMembers.map(member => ({
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        status: member.status,
        joinedAt: member.createdAt
      })),
      pendingMembers: pendingRequests.map(request => ({
        id: request.user.id,
        name: request.user.name,
        email: request.user.email,
        role: "member",
        status: "pending",
        requestedAt: request.createdAt
      }))
    });

  } catch (error) {
    console.error("Team info error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Takım bilgileri alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}
