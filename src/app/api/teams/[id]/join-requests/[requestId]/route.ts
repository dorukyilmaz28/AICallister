import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { teamJoinRequestDb } from "@/lib/database";

// Takım katılım isteğini onayla veya reddet
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
    const { requestId, action } = await req.json(); // action: 'approve' veya 'reject'

    if (!requestId || !action) {
      return NextResponse.json(
        { error: "İstek ID ve aksiyon gereklidir." },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      await teamJoinRequestDb.approve(requestId, session.user.id);
      return NextResponse.json({
        message: "Katılım isteği onaylandı."
      });
    } else if (action === 'reject') {
      await teamJoinRequestDb.reject(requestId, session.user.id);
      return NextResponse.json({
        message: "Katılım isteği reddedildi."
      });
    } else {
      return NextResponse.json(
        { error: "Geçersiz aksiyon." },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error("Error processing join request:", error);
    return NextResponse.json(
      { error: error.message || "İstek işlenirken hata oluştu." },
      { status: 400 }
    );
  }
}
