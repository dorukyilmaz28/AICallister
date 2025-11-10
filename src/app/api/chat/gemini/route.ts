import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { conversationDb } from "@/lib/database";
import { GoogleGenerativeAI } from "@google/generative-ai";

// FRC takım numaralarını tespit et (TBA API için)
function extractTeamNumbers(text: string): string[] {
  const teamNumbers: string[] = [];
  const patterns = [
    /(?:frc|team|takım)\s*(\d{1,5})/gi,
    /\b(\d{3,5})\b/g,
  ];
  
  patterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const num = match[1];
      if (num && !teamNumbers.includes(num)) {
        teamNumbers.push(num);
      }
    }
  });
  
  return teamNumbers.slice(0, 3);
}

// TBA'dan takım bilgisi çek
async function fetchTeamInfo(teamNumber: string): Promise<string> {
  try {
    const TBA_API_KEY = process.env.TBA_API_KEY || "";
    
    if (!TBA_API_KEY) {
      return "";
    }

    const teamResponse = await fetch(
      `https://www.thebluealliance.com/api/v3/team/frc${teamNumber}`,
      { headers: { "X-TBA-Auth-Key": TBA_API_KEY } }
    );

    if (!teamResponse.ok) {
      return "";
    }

    const team = await teamResponse.json();
    const currentYear = new Date().getFullYear();
    
    return `
FRC Takım ${teamNumber} (${currentYear}):
- İsim: ${team.nickname || "N/A"}
- Tam İsim: ${team.name || "N/A"}
- Şehir: ${team.city || "N/A"}, ${team.state_prov || "N/A"}, ${team.country || "N/A"}
- Rookie Yılı: ${team.rookie_year || "N/A"}
- Website: ${team.website || "N/A"}
- Kaynak: The Blue Alliance (${currentYear})
`;
  } catch (error) {
    return "";
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages, context, conversationId } = await req.json();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    // TBA RAG - Takım bilgileri
    let ragContext = "";
    const lastUserMessage = messages[messages.length - 1];
    
    if (lastUserMessage && lastUserMessage.role === "user") {
      const teamNumbers = extractTeamNumbers(lastUserMessage.content);
      
      if (teamNumbers.length > 0) {
        const teamInfoPromises = teamNumbers.map(num => fetchTeamInfo(num));
        const teamInfos = await Promise.all(teamInfoPromises);
        const validInfos = teamInfos.filter(info => info.trim() !== "");
        
        if (validInfos.length > 0) {
          ragContext = `\n\n=== TAKIM BİLGİLERİ (TBA API) ===\n${validInfos.join("\n")}\n=== BİLGİ SONU ===\n`;
        }
      }
    }

    // Gemini API
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY bulunamadı" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // System prompt
    const currentYear = new Date().getFullYear();
    const systemPrompt = `FRC (FIRST Robotics Competition) AI asistanısın.

SEN KİMSİN:
- FRC uzmanı AI
- The Blue Alliance ve WPILib dokümantasyonu kullanırsın
- Güncel sezon: ${currentYear}
- TBA API'den CANLI veri alıyorsun

KURALLAR:
1. Doğal ve yardımsever ol
2. Sadece sorulan soruya cevap ver
3. Gereksiz tekrar yapma
4. Kod örnekleri ver (gerekirse)
5. TBA verileri varsa kullan

KONULARIN: FRC takımları, robot programlama (WPILib), mekanik, strateji, yarışmalar.

${ragContext}`;

    // Gemini formatına çevir
    const geminiMessages = [
      { role: "user", parts: [{ text: systemPrompt }] },
      ...messages.slice(-4).map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }))
    ];

    // Gemini chat
    const chat = model.startChat({
      history: geminiMessages.slice(0, -1),
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(geminiMessages[geminiMessages.length - 1].parts[0].text);
    const response = await result.response;
    const aiResponse = response.text();

    const finalMessages = [...messages, { role: "assistant", content: aiResponse }];

    // Konuşmayı kaydet
    try {
      let conversation: any;
      
      if (conversationId) {
        conversation = await conversationDb.findById(conversationId);
        if (conversation) {
          for (const msg of finalMessages.slice(-2)) {
            await conversationDb.addMessage(conversationId, {
              role: msg.role,
              content: msg.content
            });
          }
        }
      } else {
        conversation = await conversationDb.create({
          userId: session.user.id,
          title: finalMessages[0]?.content?.substring(0, 50) + "..." || "Yeni Konuşma",
          context
        });
        
        for (const msg of finalMessages) {
          await conversationDb.addMessage(conversation.id, {
            role: msg.role,
            content: msg.content
          });
        }
      }
      
      return NextResponse.json({
        messages: finalMessages,
        context,
        conversationId: conversation?.id,
        timestamp: new Date().toISOString(),
        model: "gemini-1.5-flash",
        provider: "Google AI"
      });
      
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json({
        messages: finalMessages,
        context,
        timestamp: new Date().toISOString(),
        model: "gemini-1.5-flash",
        provider: "Google AI"
      });
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      {
        error: "Gemini API hatası",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

