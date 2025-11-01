import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { teamDb, userDb, teamJoinRequestDb } from "@/lib/database";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const currentUser = await userDb.findById(session.user.id);
    
    if (!currentUser || !currentUser.teamId) {
      return NextResponse.json(
        { error: "Herhangi bir takımda değilsiniz." },
        { status: 404 }
      );
    }

    // Takım bilgilerini al
    const team = await teamDb.findById(currentUser.teamId);
    if (!team) {
      return NextResponse.json(
        { error: "Takım bulunamadı." },
        { status: 404 }
      );
    }

    // Takım üyelerini al (onaylanmış üyeler)
    const members = await teamDb.getTeamMembers(currentUser.teamId);
    const approvedMembers = members.filter(member => member.status === "approved");

    // Bekleyen katılma isteklerini al
    const joinRequests = await teamJoinRequestDb.findByTeamId(currentUser.teamId);
    const pendingRequests = joinRequests.filter(req => req.status === "pending");

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
