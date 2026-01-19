import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { conversationDb } from "@/lib/database";

// Force dynamic rendering (Vercel serverless function)
export const dynamic = 'force-dynamic';

// FRC takım numaralarını tespit et
function extractTeamNumbers(text: string): string[] {
  const teamNumbers: string[] = [];
  
  // "254", "frc 254", "team 254", "takım 254" gibi formatları yakala
  const patterns = [
    /(?:frc|team|takım)\s*(\d{1,5})/gi,
    /\b(\d{3,5})\b/g,  // 3-5 haneli sayılar (muhtemelen takım numarası)
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
  
  return teamNumbers.slice(0, 3); // Max 3 takım
}

// TBA'dan takım bilgisi çek (güncel verilerle)
async function fetchTeamInfo(teamNumber: string): Promise<string> {
  try {
    const TBA_API_KEY = process.env.TBA_API_KEY || "";
    
    if (!TBA_API_KEY) {
      console.log("[TBA RAG] API key yok!");
      return "";
    }

    console.log(`[TBA RAG] Takım ${teamNumber} bilgisi çekiliyor...`);
    
    // Temel takım bilgileri
    const teamResponse = await fetch(
      `https://www.thebluealliance.com/api/v3/team/frc${teamNumber}`,
      { headers: { "X-TBA-Auth-Key": TBA_API_KEY } }
    );

    if (!teamResponse.ok) {
      console.log(`[TBA RAG] Takım ${teamNumber} bulunamadı (${teamResponse.status})`);
      return "";
    }

    const team = await teamResponse.json();
    
    // Güncel sezon yılını al (2025)
    const currentYear = new Date().getFullYear();
    
    // Son 2 sezonun etkinliklerini çek (2024, 2025)
    let recentEvents = "";
    try {
      const eventsResponse = await fetch(
        `https://www.thebluealliance.com/api/v3/team/frc${teamNumber}/events/${currentYear}`,
        { headers: { "X-TBA-Auth-Key": TBA_API_KEY } }
      );
      
      if (eventsResponse.ok) {
        const events = await eventsResponse.json();
        if (events && events.length > 0) {
          recentEvents = `\n- ${currentYear} Etkinlikleri: ${events.slice(0, 3).map((e: any) => e.name).join(", ")}`;
        }
      }
    } catch (e) {
      // Etkinlik bilgisi yoksa devam et
    }
    
    // Ödülleri çek (Awards)
    let awardsInfo = "";
    try {
      // Son 3 yılın ödüllerini çek
      const years = [currentYear, currentYear - 1, currentYear - 2];
      const allAwards: any[] = [];
      
      for (const year of years) {
        try {
          const awardsResponse = await fetch(
            `https://www.thebluealliance.com/api/v3/team/frc${teamNumber}/awards/${year}`,
            { headers: { "X-TBA-Auth-Key": TBA_API_KEY } }
          );
          
          if (awardsResponse.ok) {
            const yearAwards = await awardsResponse.json();
            if (yearAwards && yearAwards.length > 0) {
              allAwards.push(...yearAwards.map((a: any) => ({ ...a, year })));
            }
          }
        } catch (e) {
          // Yıl için ödül yoksa devam et
        }
      }
      
      if (allAwards.length > 0) {
        // Ödülleri yıl ve etkinliğe göre grupla
        const awardsByYear = allAwards.reduce((acc: any, award: any) => {
          const year = award.year;
          if (!acc[year]) acc[year] = [];
          acc[year].push(award);
          return acc;
        }, {});
        
        awardsInfo = "\n\n🏆 ÖDÜLLER:";
        
        for (const year of years) {
          if (awardsByYear[year] && awardsByYear[year].length > 0) {
            awardsInfo += `\n\n${year} Sezonu (${awardsByYear[year].length} ödül):`;
            
            // En önemli ödülleri üstte göster
            const sortedAwards = awardsByYear[year].sort((a: any, b: any) => {
              const importantTypes = ['Winner', 'Finalist', 'Chairman', 'Engineering', 'Innovation', 'Quality'];
              const aImportant = importantTypes.some(type => a.award_type?.toString().includes(type.toString()));
              const bImportant = importantTypes.some(type => b.award_type?.toString().includes(type.toString()));
              if (aImportant && !bImportant) return -1;
              if (!aImportant && bImportant) return 1;
              return 0;
            });
            
            sortedAwards.forEach((award: any, index: number) => {
              if (index < 15) { // Maksimum 15 ödül göster
                const eventName = award.event_key ? ` (${award.event_key.replace(/\d{4}/, '')})` : '';
                awardsInfo += `\n  • ${award.name}${eventName}`;
              }
            });
            
            if (awardsByYear[year].length > 15) {
              awardsInfo += `\n  ... ve ${awardsByYear[year].length - 15} ödül daha`;
            }
          }
        }
        
        console.log(`[TBA RAG] Takım ${teamNumber} için ${allAwards.length} ödül bulundu`);
      } else {
        console.log(`[TBA RAG] Takım ${teamNumber} için ödül bulunamadı`);
      }
      
    } catch (e) {
      console.log(`[TBA RAG] Ödül çekerken hata:`, e);
    }
    
    console.log(`[TBA RAG] Takım ${teamNumber} başarıyla çekildi:`, team.nickname);
    
    return `
FRC Takım ${teamNumber} Bilgileri (The Blue Alliance - ${currentYear}):
- İsim: ${team.nickname || "N/A"}
- Tam İsim: ${team.name || "N/A"}
- Şehir: ${team.city || "N/A"}, ${team.state_prov || "N/A"}, ${team.country || "N/A"}
- Rookie Yılı: ${team.rookie_year || "N/A"}
- Website: ${team.website || "N/A"}${recentEvents}${awardsInfo}
- Veri Kaynağı: The Blue Alliance (Güncel - ${currentYear})
`;
  } catch (error) {
    return "";
  }
}

// WPILib programlama konularını tespit et ve dokümantasyon ekle
function getWPILibContext(text: string): string {
  const textLower = text.toLowerCase();
  let context = "";
  
  // WPILib Keyword Mapping
  const wpilibTopics = {
    // Motor Controllers
    motor: {
      keywords: ["motor", "talon", "spark", "victor", "falcon", "neo", "kraken", "can", "pwm"],
      docs: `
WPILib Motor Controller Dokümantasyonu:
- TalonFX/TalonSRX: https://docs.wpilib.org/en/stable/docs/software/hardware-apis/motors/talonfx.html
- SparkMax: https://docs.wpilib.org/en/stable/docs/software/hardware-apis/motors/spark-max.html
- PWM Motor Controllers: https://docs.wpilib.org/en/stable/docs/software/hardware-apis/motors/pwm-controllers.html

Motor Kontrol Örnekleri:
- Motor hız kontrolü için set() metodunu kullan (değer: -1.0 ile 1.0 arası)
- Encoder okumak için getEncoder() kullan
- PID kontrolü için setPID() veya Phoenix API kullan
`
    },
    
    // Autonomous
    autonomous: {
      keywords: ["autonomous", "auto", "otonom", "pathplanner", "trajectory", "path"],
      docs: `
WPILib Autonomous Dokümantasyonu:
- Command-Based Programming: https://docs.wpilib.org/en/stable/docs/software/commandbased/index.html
- PathPlanner: https://pathplanner.dev/
- Trajectory Following: https://docs.wpilib.org/en/stable/docs/software/advanced-controls/trajectories/index.html

Autonomous Örnek:
- Commands kullanarak autonomous rutinleri oluştur
- RamseteCommand ile trajectory takibi yap
- Autonomous için SequentialCommandGroup kullan
`
    },
    
    // Sensors
    sensor: {
      keywords: ["sensor", "encoder", "gyro", "limit switch", "ultrasonic", "lidar", "vision", "limelight"],
      docs: `
WPILib Sensor Dokümantasyonu:
- Encoders: https://docs.wpilib.org/en/stable/docs/software/hardware-apis/sensors/encoders.html
- Gyroscopes: https://docs.wpilib.org/en/stable/docs/software/hardware-apis/sensors/gyros.html
- Limit Switches: https://docs.wpilib.org/en/stable/docs/software/hardware-apis/sensors/digital-inputs.html
- Vision Processing: https://docs.wpilib.org/en/stable/docs/software/vision-processing/index.html

Sensor Kullanımı:
- Encoder pozisyonu: encoder.getDistance()
- Gyro açısı: gyro.getAngle()
- Limit switch: limitSwitch.get()
`
    },
    
    // PID Control
    pid: {
      keywords: ["pid", "pidcontroller", "feedback", "control loop"],
      docs: `
WPILib PID Controller Dokümantasyonu:
- PID Control: https://docs.wpilib.org/en/stable/docs/software/advanced-controls/controllers/pidcontroller.html
- Profiled PID: https://docs.wpilib.org/en/stable/docs/software/advanced-controls/controllers/profiled-pidcontroller.html

PID Örnek:
PIDController pidController = new PIDController(kP, kI, kD);
double output = pidController.calculate(measurement, setpoint);
`
    },
    
    // Pneumatics
    pneumatic: {
      keywords: ["pneumatic", "solenoid", "compressor", "pnömatik"],
      docs: `
WPILib Pneumatics Dokümantasyonu:
- Pneumatics: https://docs.wpilib.org/en/stable/docs/software/hardware-apis/pneumatics/index.html
- Solenoids: https://docs.wpilib.org/en/stable/docs/software/hardware-apis/pneumatics/solenoids.html

Pneumatics Örnek:
Solenoid solenoid = new Solenoid(PneumaticsModuleType.CTREPCM, 0);
solenoid.set(true); // Aktif et
`
    },
    
    // Drive Systems
    drive: {
      keywords: ["drive", "swerve", "mecanum", "differential", "tank", "arcade"],
      docs: `
WPILib Drive Systems Dokümantasyonu:
- Differential Drive: https://docs.wpilib.org/en/stable/docs/software/hardware-apis/motors/wpi-drive-classes.html
- Swerve Drive: https://docs.wpilib.org/en/stable/docs/software/advanced-controls/geometry/swerve-drive-kinematics.html
- Mecanum Drive: https://docs.wpilib.org/en/stable/docs/software/hardware-apis/motors/wpi-drive-classes.html#mecanum-drive

Drive Örnek:
DifferentialDrive drive = new DifferentialDrive(leftMotor, rightMotor);
drive.arcadeDrive(speed, rotation);
`
    },
    
    // Programming Basics
    programming: {
      keywords: ["robot.java", "robot.py", "robotcontainer", "subsystem", "command", "button", "java", "python", "c++"],
      docs: `
WPILib Command-Based Programming:
- Robot Structure: https://docs.wpilib.org/en/stable/docs/software/commandbased/structuring-command-based-project.html
- Commands: https://docs.wpilib.org/en/stable/docs/software/commandbased/commands.html
- Subsystems: https://docs.wpilib.org/en/stable/docs/software/commandbased/subsystems.html
- Java Docs: https://docs.wpilib.org/en/stable/docs/software/java-libraries/index.html
- Python (RobotPy): https://robotpy.readthedocs.io/
- C++ Docs: https://docs.wpilib.org/en/stable/docs/software/cpp-libraries/index.html

Temel Yapı:
1. Robot.java/py/cpp - Ana robot sınıfı
2. RobotContainer - Robot konfigürasyonu
3. Subsystems/ - Robot alt sistemleri
4. Commands/ - Robot komutları

Dil Seçimi:
- Java: En popüler, en çok kaynak
- Python (RobotPy): Kolay öğrenilir
- C++: Performans kritik uygulamalar
`
    },
    
    // Simulation & Testing
    simulation: {
      keywords: ["simulation", "simülasyon", "test", "unit test", "shuffleboard", "glass"],
      docs: `
WPILib Simulation & Testing:
- Robot Simulation: https://docs.wpilib.org/en/stable/docs/software/wpilib-tools/robot-simulation/index.html
- Shuffleboard: https://docs.wpilib.org/en/stable/docs/software/dashboards/shuffleboard/index.html
- Glass: https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/index.html
- Unit Testing: https://docs.wpilib.org/en/stable/docs/software/advanced-gradlerio/unit-testing.html

Simulation Kullanımı:
- Kodu test etmek için fiziksel robot gerekmiyor
- Sensor ve motor davranışlarını simüle et
- GUI ile robotunuzu görselleştir
`
    }
  };
  
  // Hangi konular tespit edildi?
  const detectedTopics: string[] = [];
  
  for (const [topic, data] of Object.entries(wpilibTopics)) {
    const hasKeyword = data.keywords.some(keyword => textLower.includes(keyword));
    if (hasKeyword) {
      detectedTopics.push(data.docs);
    }
  }
  
  if (detectedTopics.length > 0) {
    context = "\n\n=== WPILib DOKÜMANTASYONU ===\n" + 
              detectedTopics.join("\n---\n") + 
              "\n=== DÖKÜMAN SONU ===\n\n" +
              "Yukarıdaki WPILib dokümantasyonunu kullanarak kod örnekleri ve açıklamalar ver.";
  }
  
  return context;
}

export async function POST(req: NextRequest) {
  try {
    console.log("=== API Route Başladı ===");
    console.log("Environment:", process.env.NODE_ENV);
    console.log("Vercel URL:", process.env.VERCEL_URL);
    
    const { messages, context, conversationId, mode, language = "tr" } = await req.json();
    console.log("Request data:", { messagesCount: messages?.length, context, conversationId, mode, language });
    
    // Kullanıcı oturumu kontrolü (hem NextAuth hem JWT token desteği)
    const user = await getAuthUser(req);
    if (!user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }
    
    
    // RAG: Kullanıcı mesajından takım numaralarını ve programlama konularını çıkar
    let ragContext = "";
    
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage && lastUserMessage.role === "user") {
      const userText = lastUserMessage.content;
      
      // ChromaDB disabled (Vercel serverless incompatible)
      
      // 1. TBA RAG - Takım bilgileri
      const teamNumbers = extractTeamNumbers(userText);
      
      if (teamNumbers.length > 0) {
        console.log("Tespit edilen takımlar:", teamNumbers);
        
        // TBA'dan bilgi çek (paralel)
        const teamInfoPromises = teamNumbers.map(num => fetchTeamInfo(num));
        const teamInfos = await Promise.all(teamInfoPromises);
        
        const validInfos = teamInfos.filter(info => info.trim() !== "");
        
        if (validInfos.length > 0) {
          const currentYear = new Date().getFullYear();
          ragContext += `\n\n=== GÜNCEL TAKIM BİLGİLERİ (The Blue Alliance - ${currentYear}) ===\n` + 
                       validInfos.join("\n") + 
                       `\n=== BİLGİ SONU ===\n\n` +
                       `ÖNEMLİ: Yukarıdaki veriler The Blue Alliance'dan CANLI çekildi (${currentYear}). Bu GÜNCEL bilgileri kullan, eski eğitim verilerini değil!\n` +
                       `ÖDÜLLER: Yukarıda 🏆 sembolü ile gösterilen ödüller TBA API'den canlı çekildi. Ödül soruları için bu listeyi kullan!`;
        }
      }
      
      // 2. WPILib RAG - Programlama dokümantasyonu
      const wpilibContext = getWPILibContext(userText);
      if (wpilibContext) {
        console.log("WPILib dokümantasyonu eklendi");
        ragContext += wpilibContext;
      }
    }

    // Moda veya context'e göre system prompt
    let systemPrompt = "";
    
    // FRC odaklı ama esnek yardımcı
    const currentYear = new Date().getFullYear();
    const frcGuidance = language === "en" ? `
WHO YOU ARE:
- You are an expert FRC (FIRST Robotics Competition) AI assistant
- You use The Blue Alliance and WPILib documentation
- CURRENT SEASON: ${currentYear}
- FRC games: 2024 (Crescendo), 2023 (Charged Up), 2022 (Rapid React), etc.
- You get CURRENT and LIVE data from TBA API - don't use old information!
- Team info: name, city, rookie year, events, AWARDS (last 3 years)

IMPORTANT RULES:
1. Be natural and helpful
2. Only answer the ASKED question - don't give irrelevant info
3. Don't repeat unnecessarily
4. Get straight to the point
5. When AWARDS are asked, use the LIVE award list from TBA

DON'T:
❌ Give irrelevant information (STAY ON TOPIC!)
❌ Repeat the same thing over and over
❌ Explain topics that weren't asked about
❌ Give unnecessary background info
❌ Give old/estimated info when TBA data is available

DO:
✅ Answer the question
✅ Be clear and concise
✅ Provide code/examples when needed
✅ Explain sufficiently (not too little, not too much)
✅ Use current data from TBA for awards

RESPOND IN ENGLISH.
` : `
SEN KİMSİN:
- FRC (FIRST Robotics Competition) konusunda uzman bir AI asistanısın
- The Blue Alliance ve WPILib dokümantasyonunu kullanırsın
- GÜNCEL SEZON: ${currentYear}
- FRC oyunları: 2024 (Crescendo), 2023 (Charged Up), 2022 (Rapid React), vb.
- TBA API'den GÜNCEL ve CANLI veri alıyorsun - eski bilgiler verme!
- Takım bilgileri: isim, şehir, rookie year, etkinlikler, ÖDÜLLER (son 3 yıl)

ÖNEMLİ KURALLAR:
1. Doğal ve yardımsever ol
2. Sadece SORULAN soruyu cevapla - alakasız bilgi verme
3. Gereksiz tekrar yapma
4. Direkt konuya gir
5. ÖDÜLLER sorulduğunda, TBA'dan gelen CANLI ödül listesini kullan

YAPMA:
❌ Alakasız bilgi verme (SORULAN KONU DIŞINA ÇIKMA!)
❌ Aynı şeyi tekrar tekrar söyleme
❌ Soru sorulmamış konuları açıklama
❌ Gereksiz ön bilgi verme
❌ TBA verisi varken eski/tahmin bilgi verme

YAP:
✅ Soruyu cevapla
✅ Net ve anlaşılır ol
✅ Gerekirse kod/örnek ver
✅ Yeterince açıkla (az değil, çok değil)
✅ Ödüller için TBA'dan gelen güncel veriyi kullan

TÜRKÇE CEVAP VER.
`;

    if (mode === "general") {
      systemPrompt = language === "en" 
        ? `You are an FRC AI assistant. You answer questions about FRC, robotics, and programming.
${frcGuidance}

YOUR TOPICS: FRC teams, competitions, robot programming (WPILib), mechanics, electronics, strategy.`
        : `FRC AI asistanısın. FRC, robotik ve programlama sorularına cevap veriyorsun.
${frcGuidance}

KONULARIN: FRC takımları, yarışmalar, robot programlama (WPILib), mekanik, elektronik, strateji.`;
    } else {
      switch (context) {
        case "strategy":
          systemPrompt = language === "en"
            ? `You are an FRC strategy expert. You help with game analysis, scouting, and alliance selection.
${frcGuidance}

YOUR TOPICS: Competition strategy, team performance, score optimization, defense/attack tactics.`
            : `FRC strateji uzmanısın. Oyun analizi, scouting, alliance seçimi konularında yardım ediyorsun.
${frcGuidance}

KONULARIN: Yarışma stratejisi, takım performansı, puan optimizasyonu, savunma/atak taktikleri.`;
          break;
        case "mechanical":
          systemPrompt = language === "en"
            ? `You are an FRC mechanical expert. You help with robot design, motor selection, and power transmission.
${frcGuidance}

YOUR TOPICS: Drive systems, motors (NEO, Falcon), pneumatics, CAD design, material selection.`
            : `FRC mekanik uzmanısın. Robot tasarımı, motor seçimi, güç aktarımı konularında yardım ediyorsun.
${frcGuidance}

KONULARIN: Sürüş sistemleri, motorlar (NEO, Falcon), pneumatik, CAD tasarım, malzeme seçimi.`;
          break;
        case "simulation":
          systemPrompt = language === "en"
            ? `You are an FRC simulation expert. You help with WPILib simulation and testing.
${frcGuidance}

YOUR TOPICS: WPILib simulation, PathPlanner, sensor simulation, testing tools.`
            : `FRC simülasyon uzmanısın. WPILib simulation ve test konularında yardım ediyorsun.
${frcGuidance}

KONULARIN: WPILib simulation, PathPlanner, sensör simülasyonu, test araçları.`;
          break;
        default:
          systemPrompt = language === "en"
            ? `You are an FRC AI assistant. You help with FRC topics.
${frcGuidance}

YOUR TOPICS: FRC teams, robots, competitions, programming, mechanics, strategy.`
            : `FRC AI asistanısın. FRC konularında yardım ediyorsun.
${frcGuidance}

KONULARIN: FRC takımları, robotlar, yarışmalar, programlama, mekanik, strateji.`;
      }
    }

    // Google Gemini API Configuration
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    
    console.log("=== GEMINI API DEBUG INFO ===");
    console.log("Model:", GEMINI_MODEL);
    console.log("API Key exists:", !!GEMINI_API_KEY);
    console.log("=== END DEBUG ===");
    
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { 
          error: "GEMINI_API_KEY bulunamadı. Lütfen environment variable'ı ayarlayın.",
        }, 
        { status: 500 }
      );
    }

    // Gemini için mesaj formatını hazırla
    // Gemini API için system instruction ve conversation history'yi birleştir
    const systemInstruction = systemPrompt + ragContext;
    
    // Son mesajları Gemini formatına dönüştür
    // Gemini API için contents array formatı kullanılıyor
    const contents: any[] = [];
    
    // System instruction varsa config'e ekle
    // Son mesajları al: En son 3 mesaj tutulacak (sliding window)
    // Her yeni mesaj geldiğinde en eski mesaj silinir
    const lastMessages = messages.slice(-3); // Son 3 mesajı al
    
    // Gemini için mesaj formatı: role ve parts içeriyor
    for (const msg of lastMessages) {
      if (msg.role === "system") continue; // System mesajlarını atla (config'de olacak)
      
      const parts: any[] = [];
      
      // Text içeriği varsa ekle
      if (msg.content && typeof msg.content === 'string') {
        parts.push({ text: msg.content });
      }
      
      if (parts.length > 0) {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: parts
        });
      }
    }

    console.log("Messages count:", contents.length);
    console.log("System instruction length:", systemInstruction.length);

    // Google Gemini API çağrısı
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
    
    const requestBody: any = {
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4000, // Yaklaşık 3000 kelime için yeterli
      }
    };

    // System instruction varsa ekle
    if (systemInstruction.trim()) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    const res = await fetch(`${endpoint}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("HTTP Status:", res.status);
    console.log("Endpoint:", endpoint);

    if (!res.ok) {
      const rawText = await res.text();
      console.error("Gemini API Error:", rawText);
      let errorMessage = "Gemini API hatası";
      
      if (res.status === 400) {
        errorMessage = "Geçersiz istek. Lütfen mesajları kontrol edin.";
      } else if (res.status === 401 || res.status === 403) {
        errorMessage = "Gemini API key geçersiz veya yetkisiz. Lütfen GEMINI_API_KEY'i kontrol edin.";
      } else if (res.status === 429) {
        errorMessage = "API rate limit aşıldı. Lütfen birkaç dakika bekleyin.";
      } else if (res.status === 500 || res.status === 503) {
        errorMessage = "Gemini servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.";
      }
      
      return NextResponse.json(
        { 
          error: errorMessage, 
          status: res.status,
          details: rawText.substring(0, 200)
        }, 
        { status: 500 }
      );
    }

    // JSON parse et
    let completion;
    try {
      completion = await res.json();
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      return NextResponse.json(
        { error: "API yanıtı parse edilemedi" },
        { status: 500 }
      );
    }

    // Gemini response formatı: candidates[0].content.parts
    let aiResponse = "";
    
    if (completion.candidates && completion.candidates.length > 0) {
      const candidate = completion.candidates[0];
      
      // Safety filter kontrolü
      if (candidate.finishReason === "SAFETY") {
        aiResponse = "Üzgünüm, güvenlik filtresi nedeniyle bu mesaja yanıt veremiyorum. Lütfen mesajınızı yeniden formüle edin.";
      } else if (candidate.finishReason === "RECITATION") {
        aiResponse = "Üzgünüm, telif hakkı koruması nedeniyle bu içeriği oluşturamıyorum.";
      } else if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        // Text parts'ları işle
        for (const part of candidate.content.parts) {
          if (part.text) {
            aiResponse += (aiResponse ? "\n\n" : "") + part.text;
          }
        }
      }
    }

    if (!aiResponse) {
      // Eğer hiç yanıt yoksa, safety blocked olabilir
      if (completion.promptFeedback?.blockReason) {
        aiResponse = `Üzgünüm, mesajınız güvenlik nedeniyle engellendi: ${completion.promptFeedback.blockReason}. Lütfen mesajınızı yeniden formüle edin.`;
      } else {
        aiResponse = "Üzgünüm, bir yanıt oluşturamadım.";
      }
    }

    // Assistant mesajı
    const assistantMessage: any = { 
      role: "assistant", 
      content: aiResponse
    };

    const finalMessages = [...messages, assistantMessage];

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
        // Kullanıcının ilk mesajını başlık olarak kullan
        const firstUserMessage = messages.find((msg: any) => msg.role === "user");
        let conversationTitle = "Yeni Konuşma";
        
        if (firstUserMessage && firstUserMessage.content) {
          // İlk kullanıcı mesajını başlık olarak kullan (max 60 karakter)
          const userQuestion = firstUserMessage.content.trim();
          conversationTitle = userQuestion.length > 60 
            ? userQuestion.substring(0, 60) + "..." 
            : userQuestion;
        }
        
        conversation = await conversationDb.create({
          userId: user.id,
          title: conversationTitle,
          context
        });
        
        // Mesajları ekle (sadece son 3 mesaj kaydet)
        const messagesToSave = finalMessages.slice(-3);
        for (const msg of messagesToSave) {
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
        model: GEMINI_MODEL,
      });
      
    } catch (dbError) {
      console.error("Database error:", dbError);
      // Veritabanı hatası olsa bile yanıtı döndür
      return NextResponse.json({
        messages: finalMessages,
        context,
        timestamp: new Date().toISOString(),
        model: GEMINI_MODEL,
      });
    }

  } catch (error: any) {
    console.error("Route Error:", error);
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    return NextResponse.json(
      {
        error: "AI servisine erişilemiyor.",
        details: error.message,
        timestamp: new Date().toISOString(),
        model: model,
      },
      { status: 500 }
    );
  }
}
