import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { teamMemberDb, teamDb, prisma } from "@/lib/database";


// Force dynamic rendering (Vercel serverless function)
export const dynamic = 'force-dynamic';

// Üyeyi takımdan çıkar (kick/remove)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const user = await getAuthUser(req);

    if (!user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const { id: teamId, userId } = await params;

    // Takımı getir
    const team = await teamDb.findById(teamId);

    if (!team) {
      return NextResponse.json(
        { error: "Takım bulunamadı." },
        { status: 404 }
      );
    }

    // Kullanıcının takımın yöneticisi olup olmadığını kontrol et
    const currentUserMembership = await prisma.teamMember.findFirst({
      where: {
        userId: user.id,
        teamId: teamId
      }
    });

    if (!currentUserMembership) {
      return NextResponse.json(
        { error: "Bu takımın üyesi değilsiniz." },
        { status: 403 }
      );
    }

    // Sadece yöneticiler (captain, manager, mentor) üye çıkarabilir
    const allowedRoles = ['captain', 'manager', 'mentor', 'admin'];
    if (!allowedRoles.includes(currentUserMembership.role)) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok. Sadece yöneticiler üye çıkarabilir." },
        { status: 403 }
      );
    }

    // Kendini çıkarmaya çalışıyor mu?
    if (userId === user.id) {
      return NextResponse.json(
        { error: "Kendinizi takımdan çıkaramazsınız." },
        { status: 400 }
      );
    }

    // Çıkarılacak kullanıcının takımda olup olmadığını kontrol et
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı." },
        { status: 404 }
      );
    }

    // Üyeyi takımdan çıkar
    await teamMemberDb.removeMember(userId, teamId);

    return NextResponse.json({
      message: `${targetUser.name || targetUser.email} takımdan başarıyla çıkarıldı.`,
      success: true
    });

  } catch (error: any) {
    console.error("Error removing team member:", error);
    
    // Hata mesajını kontrol et
    if (error.message === 'Kullanıcı bu takımda değil.') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Üye çıkarılırken hata oluştu." },
      { status: 500 }
    );
  }
}

