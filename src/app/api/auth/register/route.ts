import { NextRequest, NextResponse } from "next/server";
import { userDb, teamDb, teamMemberDb, teamNotificationDb, teamJoinRequestDb } from "@/lib/database";
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

    // Verify team number with Blue Alliance API (REQUIRED)
    let teamVerification: { isValid: boolean; team?: any; error?: string } = { isValid: false, team: null, error: undefined };
    try {
      teamVerification = await verifyTeamNumber(teamNumber);
      if (!teamVerification.isValid) {
        // Blue Alliance'da takım bulunamadı - kayıt engelleniyor
        return NextResponse.json(
          { 
            error: teamVerification.error === "Takım bulunamadı" 
              ? "Bu takım numarası The Blue Alliance sisteminde bulunamadı. Lütfen geçerli bir FRC takım numarası girin."
              : teamVerification.error === "Bağlantı hatası"
              ? "The Blue Alliance API'ye bağlanılamadı. Lütfen daha sonra tekrar deneyin."
              : "Takım doğrulaması başarısız oldu. Lütfen geçerli bir FRC takım numarası girin."
          },
          { status: 400 }
        );
      }
    } catch (apiError) {
      // API hatası durumunda kayıt engelleniyor
      console.error("Blue Alliance API error:", apiError);
      return NextResponse.json(
        { 
          error: "The Blue Alliance API'ye bağlanılamadı. Lütfen daha sonra tekrar deneyin."
        },
        { status: 503 }
      );
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

      // Takım üyesi olarak da ekle (yönetici)
      try {
        await teamMemberDb.create({
          userId: user.id,
          teamId: team.id,
          role: "captain" // Backward compatibility için captain kullanılıyor
        });
      } catch (e) {
        // zaten varsa sessizce geç
        console.warn("Admin member create warning:", e);
      }

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
      // Join request kaydı oluştur (admin panelde görünsün)
      try {
        await teamJoinRequestDb.create(user.id, team.id, `${name} katılmak istiyor`);
      } catch (e) {
        // Zaten varsa sorun etme
        console.warn("Join request create warning:", e);
      }

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
