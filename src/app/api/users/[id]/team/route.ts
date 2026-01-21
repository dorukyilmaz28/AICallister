import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { teamMemberDb, teamDb, prisma, userDb } from "@/lib/database";


// Force dynamic rendering (Vercel serverless function)
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(req);

    if (!user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const { id: userId } = await params;

    // Kullanıcının kendi bilgilerini sorguladığını kontrol et
    if (userId !== user.id) {
      return NextResponse.json(
        { error: "Yetkisiz erişim." },
        { status: 403 }
      );
    }

    // Önce kullanıcı bilgilerini al (teamNumber için)
    const user = await userDb.findById(userId);
    
    // Kullanıcının takımını bul
    let userMemberships = await teamMemberDb.findByUserId(userId);
    
    console.log(`[GET /api/users/${userId}/team] Found ${userMemberships.length} team memberships`);
    userMemberships.forEach((member, index) => {
      console.log(`[GET /api/users/${userId}/team] Membership ${index}: teamId=${member.teamId}, teamNumber=${(member as any).team?.teamNumber || 'N/A'}, role=${member.role}, status=${member.status}`);
    });

    // Kullanıcının birden fazla takımda üyeliği varsa, teamNumber'a göre doğru takımı seç
    let selectedTeamMember = null;
    if (userMemberships.length > 0) {
      if (user?.teamNumber && userMemberships.length > 1) {
        // Kullanıcının teamNumber'ına göre doğru takımı bul
        selectedTeamMember = userMemberships.find((member: any) => 
          member.team?.teamNumber === user.teamNumber
        );
        console.log(`[GET /api/users/${userId}/team] User has ${userMemberships.length} memberships. Looking for team with teamNumber=${user.teamNumber}`);
        if (selectedTeamMember) {
          console.log(`[GET /api/users/${userId}/team] Found matching team: teamId=${selectedTeamMember.teamId}, teamNumber=${(selectedTeamMember as any).team?.teamNumber}`);
        } else {
          console.log(`[GET /api/users/${userId}/team] No matching team found by teamNumber, using first membership`);
          selectedTeamMember = userMemberships[0];
        }
      } else {
        // Tek üyelik varsa veya teamNumber yoksa, ilk üyeliği kullan
        selectedTeamMember = userMemberships[0];
      }
    }

    // Üyelik bulunamazsa, onaylanmış katılım isteğine bak ve eksik üyeliği otomatik oluştur
    if (!selectedTeamMember && userMemberships.length === 0) {
      const approvedRequest = await prisma.teamJoinRequest.findFirst({
        where: { userId, status: 'approved' },
        orderBy: { createdAt: 'desc' }
      });

      if (approvedRequest?.teamId) {
        console.log(`[GET /api/users/${userId}/team] No membership but approved request found. Creating missing TeamMember for team ${approvedRequest.teamId}`);
        // Güvenli oluşturma: varsa güncelle, yoksa oluştur
        const existing = await prisma.teamMember.findFirst({
          where: { userId, teamId: approvedRequest.teamId }
        });
        if (!existing) {
          await prisma.teamMember.create({
            data: {
              userId,
              teamId: approvedRequest.teamId,
              role: 'member',
              status: 'approved'
            }
          });
        }
        // Tekrar yükle
        userMemberships = await teamMemberDb.findByUserId(userId);
        selectedTeamMember = userMemberships[0];
        console.log(`[GET /api/users/${userId}/team] Memberships reloaded after auto-fix: ${userMemberships.length}`);
      }

      if (!selectedTeamMember && userMemberships.length === 0 && user?.teamNumber) {
        // Fallback: Kullanıcının teamNumber'ına göre takım bul ve üyelik oluştur
        const teamByNumber = await teamDb.findByTeamNumber(user.teamNumber);
        if (teamByNumber && user?.status === 'approved') {
          console.log(`[GET /api/users/${userId}/team] Fallback by teamNumber (${user.teamNumber}) -> teamId (${teamByNumber.id}) with approved status. Creating TeamMember if missing.`);
          const exists = await prisma.teamMember.findFirst({
            where: { userId, teamId: teamByNumber.id }
          });
          if (!exists) {
            await prisma.teamMember.create({
              data: { userId, teamId: teamByNumber.id, role: 'member', status: 'approved' }
            });
          }
          userMemberships = await teamMemberDb.findByUserId(userId);
          selectedTeamMember = userMemberships.find((member: any) => 
            member.team?.teamNumber === user.teamNumber
          ) || userMemberships[0];
        } else if (teamByNumber) {
          console.log(`[GET /api/users/${userId}/team] Team found by teamNumber (${user.teamNumber}) -> teamId (${teamByNumber.id}) but user status='${user?.status}'. Üyelik oluşturulmadı.`);
        }
      }

      if (!selectedTeamMember) {
        console.log(`[GET /api/users/${userId}/team] No memberships found, returning 404`);
        return NextResponse.json(
          { error: "Kullanıcı hiçbir takımda değil." },
          { status: 404 }
        );
      }
    }

    const team = await teamDb.findById(selectedTeamMember!.teamId);

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
