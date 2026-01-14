import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Kullanıcı oturumu kontrolü
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const { prompt, model, aspectRatio = "1:1", imageSize = "1K" } = await req.json();
    
    // Free tier'da image generation çalışmıyor, alternatif model kullan
    // gemini-3-pro-image-preview veya billing account gerekiyor
    const imageModel = model || "gemini-2.5-flash-preview-image";

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: "Prompt gereklidir." },
        { status: 400 }
      );
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY bulunamadı." },
        { status: 500 }
      );
    }

    // Gemini Image Generation API
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${imageModel}:generateContent`;
    
    const requestBody: any = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseModalities: ["IMAGE"],
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: imageSize
        }
      }
    };

    const res = await fetch(`${endpoint}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Gemini Image API Error:", errorText);
      
      let errorMessage = "Resim üretilemedi.";
      let userFriendlyError = "Görsel oluşturma şu anda kullanılamıyor.";
      
      // Quota/Rate limit hatalarını kontrol et
      if (res.status === 429) {
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error?.code === 429) {
            userFriendlyError = "Günlük görsel oluşturma limitine ulaşıldı. Lütfen daha sonra tekrar deneyin.\n\nNot: Görsel oluşturma özelliği için Google Cloud billing account gereklidir.";
          }
        } catch (e) {
          // JSON parse hatası, genel mesaj kullan
        }
        userFriendlyError = "Görsel oluşturma limiti aşıldı. Lütfen daha sonra tekrar deneyin.\n\nGörsel oluşturma özelliği için Google Cloud billing account gereklidir.";
      }
      
      return NextResponse.json(
        { 
          error: userFriendlyError, 
          details: errorText.substring(0, 300),
          requiresBilling: res.status === 429
        },
        { status: res.status }
      );
    }

    const completion = await res.json();

    // Gemini response formatı: candidates[0].content.parts[0].inlineData
    let imageData = "";
    let mimeType = "image/png";
    
    if (completion.candidates && completion.candidates.length > 0) {
      const candidate = completion.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        const part = candidate.content.parts.find((p: any) => p.inlineData);
        if (part && part.inlineData) {
          imageData = part.inlineData.data;
          mimeType = part.inlineData.mimeType || "image/png";
        }
      }
    }

    if (!imageData) {
      return NextResponse.json(
        { error: "Resim verisi alınamadı." },
        { status: 500 }
      );
    }

    // Base64 data URI formatında döndür
    const dataUri = `data:${mimeType};base64,${imageData}`;

    return NextResponse.json({
      image: dataUri,
      mimeType: mimeType,
      model: model,
      prompt: prompt
    });

  } catch (error: any) {
    console.error("Image Generation Error:", error);
    return NextResponse.json(
      {
        error: "Resim üretilirken hata oluştu.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

