import { NextRequest, NextResponse } from "next/server";
import { userDb, teamDb, teamMemberDb, teamNotificationDb } from "@/lib/database";
import { verifyTeamNumber } from "@/lib/blueAlliance";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, teamNumber } = await req.json();

    // Validation
    if (!name || !email || !password || !teamNumber) {
      return NextResponse.json(
        { error: "Tüm alanlar zorunludur." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Şifre en az 6 karakter olmalıdır." },
        { status: 400 }
      );
    }

    // Verify team number with Blue Alliance API (optional)
    let teamVerification: { isValid: boolean; team?: any; error?: string } = { isValid: true, team: null, error: undefined };
    try {
      teamVerification = await verifyTeamNumber(teamNumber);
      if (!teamVerification.isValid) {
        console.warn("Team verification failed:", teamVerification.error);
      }
    } catch (apiError) {
      console.warn("Blue Alliance API error:", apiError);
    }

    // Create user
    const user = await userDb.create({
      name,
      email,
      password,
      teamNumber
    });

    // Find or create team
    let team = await teamDb.findByTeamNumber(teamNumber);
    if (!team) {
      // Yeni takım oluştur ve kullanıcıyı admin yap
      team = await teamDb.create({
        name: teamVerification.team?.nickname || teamVerification.team?.name || `Team ${teamNumber}`,
        teamNumber,
        description: teamVerification.team ? `${teamVerification.team.city}, ${teamVerification.team.state_prov}` : `FRC Team ${teamNumber}`,
        adminId: user.id
      });

      // Kullanıcıyı admin yap ve onayla
      await userDb.updateRole(user.id, "admin");
      await userDb.updateStatus(user.id, "approved");
      await userDb.updateTeamId(user.id, team.id);

      // Bilgilendirici bildirim: yeni takım oluşturuldu
      try {
        await teamNotificationDb.create(
          team.id,
          "team_created",
          "Yeni Takım Oluşturuldu",
          `${name} tarafından yeni takım oluşturuldu.`,
          user.id
        );
      } catch (notificationError) {
        console.error("Notification error:", notificationError);
      }
    } else {
      // Mevcut takıma katılma isteği gönder
      await userDb.updateTeamId(user.id, team.id);
      await userDb.updateStatus(user.id, "pending");

      // Bilgilendirici bildirim: katılım isteği
      try {
        await teamNotificationDb.create(
          team.id,
          "join_request",
          "Yeni Katılım İsteği",
          `${name} (${email}) takıma katılmak istiyor.`,
          user.id
        );
      } catch (notificationError) {
        console.error("Notification error:", notificationError);
      }
    }

    return NextResponse.json(
      { 
        message: team.adminId === user.id 
          ? "Takım başarıyla oluşturuldu ve siz takım yöneticisisiniz." 
          : "Takıma katılma isteğiniz gönderildi. Takım yöneticisinin onayını bekliyorsunuz.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        team: {
          id: team.id,
          name: team.name,
          teamNumber: team.teamNumber
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Kayıt sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
