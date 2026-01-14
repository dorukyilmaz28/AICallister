import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { teamNotificationDb, teamMemberDb } from "@/lib/database";

// Takım bildirimlerini getir
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const { id: teamId } = await params;

    // Takım üyesi kontrolü
    const members = await teamMemberDb.findByTeamId(teamId);
    const isMember = members.some((m: any) => m.userId === session.user.id);

    if (!isMember) {
      return NextResponse.json(
        { error: "Bu takımın üyesi değilsiniz." },
        { status: 403 }
      );
    }

    const notifications = await teamNotificationDb.findByTeamId(teamId);
    const unreadCount = await teamNotificationDb.getUnreadCount(teamId);

    return NextResponse.json({ 
      notifications,
      unreadCount 
    });

  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Bildirimler getirilirken hata oluştu." },
      { status: 500 }
    );
  }
}

// Bildirimi okundu olarak işaretle
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const { id: teamId } = await params;
    const { notificationId, markAllAsRead } = await req.json();

    // Takım üyesi kontrolü
    const members = await teamMemberDb.findByTeamId(teamId);
    const isMember = members.some((m: any) => m.userId === session.user.id);

    if (!isMember) {
      return NextResponse.json(
        { error: "Bu takımın üyesi değilsiniz." },
        { status: 403 }
      );
    }

    if (markAllAsRead) {
      await teamNotificationDb.markAllAsRead(teamId);
      return NextResponse.json({ message: "Tüm bildirimler okundu olarak işaretlendi." });
    } else if (notificationId) {
      await teamNotificationDb.markAsRead(notificationId);
      return NextResponse.json({ message: "Bildirim okundu olarak işaretlendi." });
    } else {
      return NextResponse.json(
        { error: "Bildirim ID gereklidir." },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Bildirim işaretlenirken hata oluştu." },
      { status: 500 }
    );
  }
}
