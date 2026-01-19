import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { userDb, teamDb, teamMemberDb, teamJoinRequestDb, prisma } from "@/lib/database";


// Force dynamic rendering (Vercel serverless function)
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const { userId, action } = await req.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: "Kullanıcı ID ve işlem türü gereklidir." },
        { status: 400 }
      );
    }

    // Kullanıcının takım yöneticisi olduğunu kontrol et
    const currentUser = await userDb.findById(session.user.id);
    if (!currentUser || currentUser.role !== "admin" || !currentUser.teamId) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok." },
        { status: 403 }
      );
    }

    if (action === "approve") {
      // Katılma isteğini bul
      const joinRequest = await prisma.teamJoinRequest.findFirst({
        where: {
          userId: userId,
          teamId: currentUser.teamId,
          status: "pending"
        }
      });

      if (!joinRequest) {
        return NextResponse.json(
          { error: "Bekleyen katılma isteği bulunamadı." },
          { status: 404 }
        );
      }

      // İsteği onayla (teamJoinRequestDb.approve kullanarak)
      await teamJoinRequestDb.approve(joinRequest.id, session.user.id);
      
      return NextResponse.json(
        { message: "Kullanıcı başarıyla onaylandı." },
        { status: 200 }
      );
    } else if (action === "reject") {
      // Katılma isteğini bul
      const joinRequest = await prisma.teamJoinRequest.findFirst({
        where: {
          userId: userId,
          teamId: currentUser.teamId,
          status: "pending"
        }
      });

      if (!joinRequest) {
        return NextResponse.json(
          { error: "Bekleyen katılma isteği bulunamadı." },
          { status: 404 }
        );
      }

      // İsteği reddet
      await teamJoinRequestDb.reject(joinRequest.id, session.user.id);
      
      return NextResponse.json(
        { message: "Kullanıcı reddedildi." },
        { status: 200 }
      );
    } else if (action === "make_admin") {
      // Hedef kullanıcıyı bul ve takımda olup olmadığını kontrol et
      const targetUser = await userDb.findById(userId);
      if (!targetUser || targetUser.teamId !== currentUser.teamId) {
        return NextResponse.json(
          { error: "Kullanıcı bulunamadı veya takımınızda değil." },
          { status: 404 }
        );
      }

      // Kullanıcıyı yönetici yap
      await userDb.updateRole(userId, "admin");
      
      return NextResponse.json(
        { message: "Kullanıcı yönetici yapıldı." },
        { status: 200 }
      );
    } else if (action === "remove") {
      // Hedef kullanıcıyı bul ve takımda olup olmadığını kontrol et
      const targetUser = await userDb.findById(userId);
      if (!targetUser || targetUser.teamId !== currentUser.teamId) {
        return NextResponse.json(
          { error: "Kullanıcı bulunamadı veya takımınızda değil." },
          { status: 404 }
        );
      }

      // Kullanıcıyı takımdan çıkar
      // Önce TeamMember kaydını sil, sonra User bilgilerini güncelle
      await teamMemberDb.removeMember(userId, currentUser.teamId);
      
      return NextResponse.json(
        { message: "Kullanıcı takımdan çıkarıldı." },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "Geçersiz işlem türü." },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Team management error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "İşlem sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
