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

    const { image, prompt, task = "caption" } = await req.json();

    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { error: "Resim gereklidir (base64 data URI formatında)." },
        { status: 400 }
      );
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDgRdsqEgC6xu4wjliAc5fYP7QTbSL7tj4";
    const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY bulunamadı." },
        { status: 500 }
      );
    }

    // Base64 image'dan mime type ve data'yı çıkar
    let mimeType = "image/jpeg";
    let imageData = "";
    
    if (image.startsWith('data:')) {
      const matches = image.match(/data:([^;]+);base64,(.+)/);
      if (matches) {
        mimeType = matches[1];
        imageData = matches[2];
      } else {
        return NextResponse.json(
          { error: "Geçersiz resim formatı." },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Resim base64 data URI formatında olmalıdır." },
        { status: 400 }
      );
    }

    // Varsayılan prompt'lar
    const defaultPrompts: Record<string, string> = {
      caption: "Bu resmi açıkla ve detaylı bir açıklama yap.",
      describe: "Bu resimde ne var? Detaylı bir açıklama yap.",
      analyze: "Bu resmi analiz et ve içeriğini açıkla.",
      ocr: "Bu resimdeki tüm metni oku ve yaz."
    };

    const analysisPrompt = prompt || defaultPrompts[task] || defaultPrompts.caption;

    // Gemini API çağrısı
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
    
    const requestBody: any = {
      contents: [{
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: imageData
            }
          },
          { text: analysisPrompt }
        ]
      }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2000,
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
      console.error("Gemini Image Analysis Error:", errorText);
      return NextResponse.json(
        { error: "Resim analiz edilemedi.", details: errorText.substring(0, 200) },
        { status: res.status }
      );
    }

    const completion = await res.json();

    // Gemini response formatı: candidates[0].content.parts[0].text
    let analysisResult = "";
    if (completion.candidates && completion.candidates.length > 0) {
      const candidate = completion.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        for (const part of candidate.content.parts) {
          if (part.text) {
            analysisResult += (analysisResult ? "\n\n" : "") + part.text;
          }
        }
      }
    }

    if (!analysisResult) {
      return NextResponse.json(
        { error: "Analiz sonucu alınamadı." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      result: analysisResult,
      task: task,
      model: GEMINI_MODEL
    });

  } catch (error: any) {
    console.error("Image Analysis Error:", error);
    return NextResponse.json(
      {
        error: "Resim analiz edilirken hata oluştu.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

