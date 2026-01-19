import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { userDb, teamDb } from "@/lib/database";


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

    const { teamNumber } = await req.json();

    if (!teamNumber) {
      return NextResponse.json(
        { error: "Takım numarası gereklidir." },
        { status: 400 }
      );
    }

    // Takımı bul
    const team = await teamDb.findByTeamNumber(teamNumber);
    
    if (!team) {
      return NextResponse.json(
        { error: "Bu takım numarası bulunamadı." },
        { status: 404 }
      );
    }

    // Kullanıcının takım ID'sini güncelle ve durumunu pending yap
    await userDb.updateTeamId(session.user.id, team.id);
    await userDb.updateStatus(session.user.id, "pending");

    return NextResponse.json(
      { 
        message: "Takıma katılma isteğiniz gönderildi. Takım yöneticisinin onayını bekliyorsunuz.",
        team: {
          id: team.id,
          name: team.name,
          teamNumber: team.teamNumber
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Team join error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Takıma katılırken bir hata oluştu." },
      { status: 500 }
    );
  }
}
