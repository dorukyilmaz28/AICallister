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
      team = await teamDb.create({
        name: teamVerification.team?.nickname || teamVerification.team?.name || `Team ${teamNumber}`,
        teamNumber,
        description: teamVerification.team ? `${teamVerification.team.city}, ${teamVerification.team.state_prov}` : `FRC Team ${teamNumber}`
      });
    }

    // Kullanıcıyı otomatik olarak takıma üye yap (onay yok)
    try {
      await teamMemberDb.create({
        userId: user.id,
        teamId: team.id,
        role: "member"
      });
    } catch (membershipError) {
      // Zaten üye ise sessizce geç
      console.warn("Membership create skipped:", membershipError);
    }

    // Bilgilendirici bildirim: yeni üye katıldı
    try {
      await teamNotificationDb.create(
        team.id,
        "member_joined",
        "Yeni Üye Katıldı",
        `${name} (${email}) takıma katıldı.`,
        user.id
      );
    } catch (notificationError) {
      console.error("Notification error:", notificationError);
      // Bildirim hatası kayıt işlemini etkilemesin
    }

    return NextResponse.json(
      { 
        message: "Kullanıcı başarıyla oluşturuldu.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
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
