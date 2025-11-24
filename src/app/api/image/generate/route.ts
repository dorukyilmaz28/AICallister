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

    const { prompt, model = "gemini-2.5-flash-image", aspectRatio = "1:1", imageSize = "1K" } = await req.json();

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
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    
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
      return NextResponse.json(
        { error: "Resim üretilemedi.", details: errorText.substring(0, 200) },
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

