import { NextRequest, NextResponse } from "next/server";


// Force dynamic rendering (Vercel serverless function)
export const dynamic = 'force-dynamic';

// The Blue Alliance API - Team bilgileri getir
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teamNumber = searchParams.get("team");
    const query = searchParams.get("query");

    if (!teamNumber && !query) {
      return NextResponse.json(
        { error: "Team number veya query gerekli" },
        { status: 400 }
      );
    }

    // TBA API Key - Vercel environment variable'dan gelecek
    const TBA_API_KEY = process.env.TBA_API_KEY || "demo_key";
    
    let tbaData = null;

    // Takım bilgisi getir
    if (teamNumber) {
      const teamResponse = await fetch(
        `https://www.thebluealliance.com/api/v3/team/frc${teamNumber}`,
        {
          headers: {
            "X-TBA-Auth-Key": TBA_API_KEY,
          },
        }
      );

      if (!teamResponse.ok) {
        return NextResponse.json(
          { error: "Takım bulunamadı" },
          { status: 404 }
        );
      }

      const team = await teamResponse.json();

      // Takımın son sezon performansını getir
      const year = new Date().getFullYear();
      const eventsResponse = await fetch(
        `https://www.thebluealliance.com/api/v3/team/frc${teamNumber}/events/${year}`,
        {
          headers: {
            "X-TBA-Auth-Key": TBA_API_KEY,
          },
        }
      );

      let events = [];
      if (eventsResponse.ok) {
        events = await eventsResponse.json();
      }

      tbaData = {
        team: {
          key: team.key,
          team_number: team.team_number,
          nickname: team.nickname,
          name: team.name,
          city: team.city,
          state_prov: team.state_prov,
          country: team.country,
          rookie_year: team.rookie_year,
          website: team.website,
        },
        events: events.slice(0, 5).map((event: any) => ({
          key: event.key,
          name: event.name,
          event_type: event.event_type,
          start_date: event.start_date,
          end_date: event.end_date,
        })),
      };
    }

    // Genel arama (takım isimleri vb.)
    if (query && !teamNumber) {
      // Basit mock arama - gerçek implementasyon için TBA search API kullanılabilir
      tbaData = {
        query: query,
        message: "TBA arama özelliği yakında eklenecek",
      };
    }

    return NextResponse.json({
      success: true,
      data: tbaData,
      source: "The Blue Alliance API",
    });

  } catch (error) {
    console.error("TBA API Error:", error);
    return NextResponse.json(
      { error: "TBA API'ye erişilemiyor" },
      { status: 500 }
    );
  }
}

