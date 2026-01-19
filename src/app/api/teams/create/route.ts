import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { teamDb, userDb } from "@/lib/database";


// Force dynamic rendering (Vercel serverless function)
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    
    if (!user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const { name, teamNumber, description } = await req.json();

    // Validation
    if (!name || !teamNumber) {
      return NextResponse.json(
        { error: "Takım adı ve numarası zorunludur." },
        { status: 400 }
      );
    }

    // Takım oluştur
    const team = await teamDb.create({
      name,
      teamNumber,
      description,
      adminId: user.id
    });

    // Kullanıcıyı takım yöneticisi yap
    await userDb.updateRole(user.id, "admin");
    await userDb.updateStatus(user.id, "approved");
    await userDb.updateTeamId(user.id, team.id);

    return NextResponse.json(
      { 
        message: "Takım başarıyla oluşturuldu.",
        team: {
          id: team.id,
          name: team.name,
          teamNumber: team.teamNumber,
          description: team.description
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Team creation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Takım oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}
