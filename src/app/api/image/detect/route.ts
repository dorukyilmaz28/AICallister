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

    const { image, customPrompt } = await req.json();

    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { error: "Resim gereklidir (base64 data URI formatında)." },
        { status: 400 }
      );
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
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
    }

    // Object detection için özel prompt
    const detectionPrompt = customPrompt || 
      "Detect all of the prominent items in the image. The box_2d should be [ymin, xmin, ymax, xmax] normalized to 0-1000. Return as JSON array with label and box_2d fields.";

    // Gemini API çağrısı - JSON response iste
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
          { text: detectionPrompt }
        ]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
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
      console.error("Gemini Object Detection Error:", errorText);
      return NextResponse.json(
        { error: "Nesne tespiti yapılamadı.", details: errorText.substring(0, 200) },
        { status: res.status }
      );
    }

    const completion = await res.json();

    // JSON response parse et
    let detectionResult: any = null;
    if (completion.candidates && completion.candidates.length > 0) {
      const candidate = completion.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        const textPart = candidate.content.parts.find((p: any) => p.text);
        if (textPart && textPart.text) {
          try {
            // JSON'ı parse et (markdown code block'tan çıkarmaya çalış)
            let jsonText = textPart.text.trim();
            if (jsonText.startsWith('```')) {
              jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            }
            detectionResult = JSON.parse(jsonText);
          } catch (e) {
            console.error("JSON parse error:", e);
            return NextResponse.json(
              { error: "Detection sonucu parse edilemedi.", raw: textPart.text.substring(0, 200) },
              { status: 500 }
            );
          }
        }
      }
    }

    if (!detectionResult) {
      return NextResponse.json(
        { error: "Nesne tespiti sonucu alınamadı." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      detections: Array.isArray(detectionResult) ? detectionResult : [detectionResult],
      model: GEMINI_MODEL
    });

  } catch (error: any) {
    console.error("Object Detection Error:", error);
    return NextResponse.json(
      {
        error: "Nesne tespiti yapılırken hata oluştu.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

