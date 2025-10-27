import { NextRequest, NextResponse } from "next/server";
import { verifyTeamNumber } from "@/lib/blueAlliance";

export async function POST(req: NextRequest) {
  try {
    const { teamNumber } = await req.json();

    if (!teamNumber) {
      return NextResponse.json(
        { isValid: false, error: "Takım numarası gereklidir" },
        { status: 400 }
      );
    }

    // Blue Alliance API ile doğrula
    const result = await verifyTeamNumber(teamNumber);

    if (result.isValid && result.team) {
      return NextResponse.json({
        isValid: true,
        teamName: result.team.nickname || result.team.name,
        teamInfo: {
          number: result.team.team_number,
          name: result.team.name,
          nickname: result.team.nickname,
          city: result.team.city,
          state: result.team.state_prov,
          country: result.team.country,
          rookieYear: result.team.rookie_year,
        }
      });
    } else {
      return NextResponse.json({
        isValid: false,
        error: result.error || "Takım bulunamadı"
      });
    }

  } catch (error) {
    console.error("Team verification error:", error);
    return NextResponse.json(
      { isValid: false, error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
