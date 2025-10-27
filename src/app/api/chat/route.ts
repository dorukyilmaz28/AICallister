import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    console.log("=== API Route Başladı ===");
    console.log("Environment:", process.env.NODE_ENV);
    console.log("Vercel URL:", process.env.VERCEL_URL);
    
    const { messages, context, conversationId } = await req.json();
    console.log("Request data:", { messagesCount: messages?.length, context, conversationId });
    
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

    // Context'e göre system prompt
    let systemPrompt = "";
    switch (context) {
      case "strategy":
        systemPrompt = "Sen bir FRC strateji uzmanısın. Robot stratejileri, oyun analizi ve takım koordinasyonu konularında yardım ediyorsun.";
        break;
      case "mechanical":
        systemPrompt = "Sen bir FRC mekanik tasarım uzmanısın. Robot mekaniği, motor seçimi, güç aktarımı ve mekanik tasarım konularında yardım ediyorsun.";
        break;
      case "simulation":
        systemPrompt = "Sen bir FRC simülasyon uzmanısın. Robot simülasyonu, fizik motorları ve test ortamları konularında yardım ediyorsun.";
        break;
      default:
        systemPrompt = "Sen bir FRC uzmanısın. Genel FRC konularında, robot tasarımı, programlama ve yarışma stratejileri hakkında yardım ediyorsun.";
    }

    // Free sürüm için optimize edilmiş mesaj dizisi
    const optimizedMessages = [
      { role: "system", content: systemPrompt },
      ...messages.slice(-2) // Son 2 mesaj
    ];

    // API key'i environment variable'dan al (geçici olarak hardcode)
    const apiKey = process.env.OPENROUTER_API_KEY || "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";
    
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
        general: "Merhaba! FRC AI asistanınızım. Genel FRC konularında size yardımcı olabilirim. Robot tasarımı, programlama, yarışma stratejileri ve takım yönetimi hakkında sorularınızı sorabilirsiniz.",
        strategy: "Strateji uzmanı olarak size yardımcı olabilirim. Robot stratejileri, oyun analizi, takım koordinasyonu ve yarışma taktikleri konularında sorularınızı yanıtlayabilirim.",
        mechanical: "Mekanik tasarım uzmanı olarak robot mekaniği, motor seçimi, güç aktarımı, şanzıman tasarımı ve mekanik optimizasyon konularında size yardımcı olabilirim.",
        simulation: "Simülasyon uzmanı olarak robot simülasyonu, fizik motorları, test ortamları ve performans analizi konularında size yardımcı olabilirim."
      };
      
      const mockResponse = mockResponses[context as keyof typeof mockResponses] || mockResponses.general;
      
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
        model: "google/gemma-3-27b-it:free",
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
        conversation = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            userId: session.user.id,
          },
        });
        
        if (conversation) {
          // Yeni mesajları ekle
          await prisma.message.createMany({
            data: finalMessages.slice(-2).map((msg) => ({
              role: msg.role,
              content: msg.content,
              conversationId: conversation.id,
            })),
          });
          
          // Konuşmayı güncelle
          await prisma.conversation.update({
            where: { id: conversation.id },
            data: { updatedAt: new Date() },
          });
        }
      } else {
        // Yeni konuşma oluştur
        conversation = await prisma.conversation.create({
          data: {
            title: finalMessages[0]?.content?.substring(0, 50) + "..." || "Yeni Konuşma",
            context,
            userId: session.user.id,
            messages: {
              create: finalMessages.map((msg) => ({
                role: msg.role,
                content: msg.content,
              })),
            },
          },
        });
      }
      
      return NextResponse.json({
        messages: finalMessages,
        context,
        conversationId: conversation?.id,
        timestamp: new Date().toISOString(),
        model: "google/gemma-3-27b-it:free",
      });
      
    } catch (dbError) {
      console.error("Database error:", dbError);
      // Veritabanı hatası olsa bile yanıtı döndür
      return NextResponse.json({
        messages: finalMessages,
        context,
        timestamp: new Date().toISOString(),
        model: "google/gemma-3-27b-it:free",
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
