import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { teamMemberDb, teamDb } from "@/lib/database";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const { id: userId } = await params;

    // Kullanıcının kendi bilgilerini sorguladığını kontrol et
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: "Yetkisiz erişim." },
        { status: 403 }
      );
    }

    // Kullanıcının takımını bul
    const userMemberships = await teamMemberDb.findByUserId(userId);
    
    console.log(`[GET /api/users/${userId}/team] Found ${userMemberships.length} team memberships`);
    userMemberships.forEach((member, index) => {
      console.log(`[GET /api/users/${userId}/team] Membership ${index}: teamId=${member.teamId}, role=${member.role}, status=${member.status}`);
    });
    
    if (userMemberships.length === 0) {
      console.log(`[GET /api/users/${userId}/team] No memberships found, returning 404`);
      return NextResponse.json(
        { error: "Kullanıcı hiçbir takımda değil." },
        { status: 404 }
      );
    }

    // İlk takımını al (birden fazla takımda olabilir)
    const teamMember = userMemberships[0];
    const team = await teamDb.findById(teamMember.teamId);

    if (!team) {
      return NextResponse.json(
        { error: "Takım bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      teamId: team.id,
      teamName: team.name,
      teamNumber: team.teamNumber,
      userRole: teamMember.role,
    });

  } catch (error) {
    console.error("Error fetching user team:", error);
    return NextResponse.json(
      { error: "Takım bilgisi alınırken hata oluştu." },
      { status: 500 }
    );
  }
}
