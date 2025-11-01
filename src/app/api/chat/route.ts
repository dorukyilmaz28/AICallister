import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { conversationDb } from "@/lib/database";

export async function POST(req: NextRequest) {
  try {
    console.log("=== API Route Başladı ===");
    console.log("Environment:", process.env.NODE_ENV);
    console.log("Vercel URL:", process.env.VERCEL_URL);
    
    const { messages, context, conversationId, mode } = await req.json();
    console.log("Request data:", { messagesCount: messages?.length, context, conversationId, mode });
    
    // Kullanıcı oturumu kontrolü
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }
    
    // Son kullanıcı mesajını kontrol et
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage && lastUserMessage.role === "user") {
      const charCount = lastUserMessage.content.trim().length;
      if (charCount > 200) {
        return NextResponse.json(
          { 
            error: "Mesajınız çok uzun. Maksimum 200 karakter kullanabilirsiniz.",
            charCount,
            maxChars: 200
          },
          { status: 400 }
        );
      }
    }

    // Moda veya context'e göre system prompt
    let systemPrompt = "";
    
    // Tüm modlarda FRC'ye odaklanacağız
    const frcRestriction = `
ÖNEMLI KURALLAR:
- SADECE FRC (FIRST Robotics Competition) konularında yardım et.
- FRC dışı sorulara (hava durumu, genel kültür, günlük hayat vb.) ASLA cevap verme.
- FRC dışı bir soru gelirse: "Üzgünüm, ben sadece FRC (FIRST Robotics Competition) konularında uzmanım. FRC ile ilgili sorularınız için buradayım." de.
- Bilgilerini şu resmi kaynaklardan al:
  * The Blue Alliance (TBA) - Takım bilgileri ve yarışma verileri
  * WPILib Documentation - Robot programlama ve kontrol sistemleri
  * FIRST Official Documentation - Yarışma kuralları ve rehberler
  * FRC Game Manual - Oyun kuralları ve stratejiler
- Emin olmadığın konularda spekülasyon yapma, bunun yerine resmi dokümanlara yönlendir.
- Kod örnekleri verirken WPILib standartlarına uy (Java/C++/Python).
`;

    if (mode === "general") {
      // Genel mod da artık sadece FRC konularına odaklı
      systemPrompt = `Sen bir FRC (FIRST Robotics Competition) uzmanısın. Genel FRC konularında, robot tasarımı, programlama, mekanik, elektronik ve yarışma stratejileri hakkında yardım ediyorsun.
${frcRestriction}

KONULAR:
- Robot programlama (Java, C++, Python ile WPILib)
- Mekanik tasarım ve imalat
- Elektronik sistemler ve kablolama
- Otonom ve teleop stratejileri
- Takım yönetimi ve organizasyon
- Yarışma kuralları ve puanlama
- Görüntü işleme ve sensörler`;
    } else {
      switch (context) {
        case "strategy":
          systemPrompt = `Sen bir FRC strateji uzmanısın. Robot stratejileri, oyun analizi, takım koordinasyonu ve yarışma taktikleri konularında yardım ediyorsun.
${frcRestriction}

UZMANLIK ALANIN:
- Oyun analizi ve puan optimizasyonu
- Alliance stratejileri ve koordinasyon
- Match scouting ve veri analizi
- Robot tasarım kararlarının stratejik etkileri
- Eleme ve playoff stratejileri
- Savunma ve ofansif taktikler

The Blue Alliance verilerini referans al ve gerçek takım performanslarına dayanan stratejiler öner.`;
          break;
        case "mechanical":
          systemPrompt = `Sen bir FRC mekanik tasarım uzmanısın. Robot mekaniği, motor seçimi, güç aktarımı, şanzıman tasarımı ve mekanik optimizasyon konularında yardım ediyorsun.
${frcRestriction}

UZMANLIK ALANIN:
- Sürüş sistemleri (tank, mecanum, swerve drive)
- Motor seçimi (NEO, Falcon 500, CIM vb.)
- Dişli oranları ve güç aktarımı
- Pneumatik ve hidrolik sistemler
- CAD tasarım (OnShape, SolidWorks, Fusion 360)
- Malzeme seçimi ve imalat yöntemleri
- FRC kurallarına uygun tasarım (boyut, ağırlık limitleri)

WPILib Hardware Documentation ve FRC Vendor Documentation'ı referans al.`;
          break;
        case "simulation":
          systemPrompt = `Sen bir FRC simülasyon ve test uzmanısın. Robot simülasyonu, fizik motorları, test ortamları ve performans analizi konularında yardım ediyorsun.
${frcRestriction}

UZMANLIK ALANIN:
- WPILib Robot Simulation
- Physics simulation ve modeling
- Sensor simülasyonu (gyro, encoders, vision)
- Autonomous mode testing
- PathPlanner ve trajectory generation
- Dashboard ve telemetri (Shuffleboard, Glass)
- Unit testing ve integration testing

WPILib Simulation Documentation ve örnek projelerini referans al.`;
          break;
        default:
          systemPrompt = `Sen bir FRC (FIRST Robotics Competition) uzmanısın. Genel FRC konularında, robot tasarımı, programlama ve yarışma stratejileri hakkında yardım ediyorsun.
${frcRestriction}

Robot programlama, mekanik tasarım, elektronik sistemler, strateji geliştirme ve takım organizasyonu konularında yardımcı oluyorsun.`;
      }
    }

    // Free sürüm için optimize edilmiş mesaj dizisi
    const optimizedMessages = [
      { role: "system", content: systemPrompt },
      ...messages.slice(-2) // Son 2 mesaj
    ];

    // API key'i environment variable'dan al
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    console.log("=== DEBUG INFO ===");
    console.log("All env vars:", Object.keys(process.env).filter(key => key.includes('OPENROUTER')));
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("Current working directory:", process.cwd());
    console.log("API Key check:", {
      exists: !!apiKey,
      length: apiKey?.length || 0,
      startsWith: apiKey?.substring(0, 10) || "N/A",
      source: process.env.OPENROUTER_API_KEY ? "env" : "hardcoded"
    });
    console.log("=== END DEBUG ===");
    
    if (!apiKey) {
      console.log("API key bulunamadı, mock response döndürülüyor");
      
      // Mock response - API key olmadığında geçici çözüm
      const mockResponses = {
        frc: {
          general: "Merhaba! FRC (FIRST Robotics Competition) AI asistanınızım. Robot tasarımı, WPILib programlama, mekanik sistemler, yarışma stratejileri ve takım yönetimi konularında size yardımcı olabilirim. The Blue Alliance ve WPILib Documentation'ı baz alarak doğru bilgiler veriyorum. FRC ile ilgili sorularınızı sorabilirsiniz!",
          strategy: "FRC strateji uzmanınızım. Oyun analizi, alliance stratejileri, scouting, robot tasarım kararlarının stratejik etkileri konularında yardımcı olabilirim. The Blue Alliance verilerini kullanarak gerçek performans analizleri yapabilirim. FRC stratejileri hakkında sorularınızı sorabilirsiniz!",
          mechanical: "FRC mekanik tasarım uzmanınızım. Sürüş sistemleri (swerve, mecanum, tank drive), motor seçimi (NEO, Falcon 500), güç aktarımı, pneumatik sistemler ve FRC kurallarına uygun tasarım konularında yardımcı olabilirim. WPILib Hardware Documentation'ı referans alıyorum. FRC mekaniği hakkında sorularınızı sorabilirsiniz!",
          simulation: "FRC simülasyon uzmanınızım. WPILib Robot Simulation, sensor modellemesi, autonomous testing, PathPlanner ve telemetri sistemleri konularında yardımcı olabilirim. WPILib Simulation Documentation'ı takip ediyorum. FRC simülasyonu hakkında sorularınızı sorabilirsiniz!"
        },
        general: "Merhaba! FRC (FIRST Robotics Competition) AI asistanınızım. Sadece FRC konularında uzmanım. Robot programlama, mekanik tasarım, elektronik sistemler, strateji ve yarışma kuralları hakkında sorularınıza cevap verebilirim. FRC ile ilgili sorularınız için buradayım!"
      } as const;
      
      const mockResponse = mode === "general"
        ? mockResponses.general
        : (mockResponses.frc[context as keyof typeof mockResponses.frc] || mockResponses.frc.general);
      
      return NextResponse.json({
        messages: [...messages, { role: "assistant", content: mockResponse }],
        context,
        timestamp: new Date().toISOString(),
        model: "mock-response",
        note: "Bu geçici bir yanıttır. Gerçek AI yanıtları için OPENROUTER_API_KEY ayarlayın."
      });
    }
    
    console.log("Messages count:", optimizedMessages.length);

    // OpenRouter API çağrısı
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000",
        "X-Title": "Callister FRC AI Assistant",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3.1:free",
        messages: optimizedMessages,
        max_tokens: 4000, // Çok daha uzun yanıtlar için
        temperature: 0.7,
      }),
    });

    console.log("HTTP Status:", res.status);
    
    // Raw response'u al
    const rawText = await res.text();
    console.log("Raw response length:", rawText.length);

    if (!res.ok) {
      console.error("OpenRouter Error:", rawText);
      let errorMessage = "OpenRouter API hatası";
      
      if (res.status === 401) {
        errorMessage = "API key geçersiz veya süresi dolmuş. Lütfen Vercel dashboard'da OPENROUTER_API_KEY'i kontrol edin.";
      } else if (res.status === 429) {
        errorMessage = "API rate limit aşıldı. Lütfen birkaç dakika bekleyin.";
      } else if (res.status === 402) {
        errorMessage = "API kredisi yetersiz. Lütfen OpenRouter hesabınızı kontrol edin.";
      }
      
      return NextResponse.json(
        { 
          error: errorMessage, 
          status: res.status,
          details: rawText.substring(0, 200) // İlk 200 karakter
        }, 
        { status: 500 }
      );
    }

    // JSON parse et
    let completion;
    try {
      completion = JSON.parse(rawText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      return NextResponse.json(
        { error: "API yanıtı parse edilemedi", raw: rawText.substring(0, 200) },
        { status: 500 }
      );
    }

    let aiResponse = completion.choices?.[0]?.message?.content || "Üzgünüm, bir yanıt oluşturamadım.";
    
    // AI yanıtındaki istenmeyen token'ları temizle
    aiResponse = aiResponse
      .replace(/REDACTED_SPECIAL_TOKEN/g, '')
      .replace(/REDACTED.*?TOKEN/g, '')
      .replace(/\[REDACTED.*?\]/g, '')
      .replace(/<\| begin_of_sentence \|>/g, '')
      .replace(/<\| end_of_sentence \|>/g, '')
      .replace(/<\|.*?\|>/g, '')
      .trim();

    const finalMessages = [...messages, { role: "assistant", content: aiResponse }];

    // Konuşmayı veritabanına kaydet
    try {
      let conversation: any;
      
      if (conversationId) {
        // Mevcut konuşmayı güncelle
        conversation = await conversationDb.findById(conversationId);
        
        if (conversation) {
          // Yeni mesajları ekle
          for (const msg of finalMessages.slice(-2)) {
            await conversationDb.addMessage(conversationId, {
              role: msg.role,
              content: msg.content
            });
          }
        }
      } else {
        // Yeni konuşma oluştur
        conversation = await conversationDb.create({
          userId: session.user.id,
          title: finalMessages[0]?.content?.substring(0, 50) + "..." || "Yeni Konuşma",
          context
        });
        
        // Mesajları ekle
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
        model: "deepseek/deepseek-chat-v3.1:free",
      });
      
    } catch (dbError) {
      console.error("Database error:", dbError);
      // Veritabanı hatası olsa bile yanıtı döndür
      return NextResponse.json({
        messages: finalMessages,
        context,
        timestamp: new Date().toISOString(),
        model: "deepseek/deepseek-chat-v3.1:free",
      });
    }

  } catch (error: any) {
    console.error("Route Error:", error);
    return NextResponse.json(
      {
        error: "AI servisine erişilemiyor.",
        details: error.message,
        timestamp: new Date().toISOString(),
        model: "fallback",
      },
      { status: 500 }
    );
  }
}
