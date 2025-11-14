import { NextRequest, NextResponse } from "next/server";
import { verifyTeamNumber, searchTeam } from "@/lib/blueAlliance";

export async function POST(req: NextRequest) {
  try {
    const { teamNumber, teamName } = await req.json();

    // Takım numarası veya adından biri olmalı
    const searchQuery = teamNumber || teamName;

    if (!searchQuery) {
      return NextResponse.json(
        { isValid: false, error: "Takım numarası veya adı gereklidir" },
        { status: 400 }
      );
    }

    // Blue Alliance API ile ara (numara veya ad ile)
    const searchResult = await searchTeam(searchQuery);

    if (searchResult.teams && searchResult.teams.length > 0) {
      // İlk sonucu döndür
      const team = searchResult.teams[0];
      return NextResponse.json({
        isValid: true,
        teamName: team.nickname || team.name,
        teamInfo: {
          number: team.team_number,
          name: team.name,
          nickname: team.nickname,
          city: team.city,
          state: team.state_prov,
          country: team.country,
          rookieYear: team.rookie_year,
        },
        // Eğer birden fazla sonuç varsa, bunları da döndür
        suggestions: searchResult.teams.length > 1 ? searchResult.teams.slice(1, 6).map(t => ({
          number: t.team_number,
          name: t.name,
          nickname: t.nickname,
          city: t.city,
          state: t.state_prov,
        })) : []
      });
    } else {
      return NextResponse.json({
        isValid: false,
        error: searchResult.error || "Takım bulunamadı"
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
