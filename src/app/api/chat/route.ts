import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { conversationDb } from "@/lib/database";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Force dynamic rendering (Vercel serverless function)
export const dynamic = 'force-dynamic';

// FRC takım numaralarını tespit et
function extractTeamNumbers(text: string, maxTeams = 3): string[] {
  const teamNumbers: string[] = [];

  // "254", "frc 254", "team 254", "takım 254" gibi formatları yakala
  const patterns = [
    /(?:frc|team|takım)\s*(\d{1,5})/gi,
    /\b(\d{3,5})\b/g, // 3-5 haneli sayılar (muhtemelen takım numarası)
  ];

  const isLikelyYearNotTeam = (num: string) => {
    if (!/^\d{4}$/.test(num)) return false;
    const y = parseInt(num, 10);
    return y >= 2020 && y <= 2035;
  };

  patterns.forEach((pattern) => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const num = match[1];
      if (num && !isLikelyYearNotTeam(num) && !teamNumbers.includes(num)) {
        teamNumbers.push(num);
      }
    }
  });

  return teamNumbers.slice(0, Math.max(1, Math.min(maxTeams, 8)));
}

/** İttifak seçimi / OPR / scouting tarzı sorularda daha çok takım numarası yakala */
function wantsAllianceSelectionContext(text: string): boolean {
  const t = text.toLowerCase();
  const keys = [
    "ittifak",
    "alliance",
    "allianceselection",
    "seçim",
    "secim",
    "pick list",
    "picklist",
    "first pick",
    "second pick",
    "third pick",
    "draft",
    "scouting",
    "hangi takım",
    "kimle ittifak",
    "opr",
    "dpr",
    "ccwm",
    "güç skor",
    "guc skor",
    "sıralama skor",
    "sirala",
    "ranking score",
    "average score",
    "skor ort",
    "alliance captain",
  ];
  return keys.some((k) => t.includes(k));
}

/** Kullanıcı tüm regionaldeki takımları istediğinde tam tablo */
function wantsEntireRegionalAnalysis(text: string): boolean {
  const t = text.toLowerCase();
  return (
    /\b(tüm|bütün|butun|hepsi|tümü|her\s*takım|bütün\s*takım|tüm\s*takım|tum\s*takim)\b/.test(t) ||
    /\b(all teams|every team|full field|entire regional)\b/.test(t) ||
    /\b(tüm|bütün|tum)\s+reg/.test(t) ||
    /\breg(ional)?\s*(deki|daki)?\s*(tüm|bütün|her|tum|butun)\b/.test(t) ||
    /\b(field|saha)\s*(tüm|bütün|tam)\b/.test(t)
  );
}

function normalizeTbaSearch(s: string): string {
  let t = s.toLowerCase().trim();
  const tr: Record<string, string> = {
    ç: "c",
    ğ: "g",
    ı: "i",
    i: "i",
    ö: "o",
    ş: "s",
    ü: "u",
  };
  for (const [a, b] of Object.entries(tr)) {
    t = t.split(a).join(b);
  }
  return t.replace(/[^a-z0-9]+/g, "");
}

/**
 * Mesajdan TBA event_key (ör. 2026tuha) veya etkinlik adı parçası çıkarır.
 * "Avrasya reg", "2026tuha", "Marmara Regional" vb.
 */
function extractRegionalSearchQuery(text: string): string | null {
  const trimmed = text.trim();

  const keyMatch = trimmed.match(/\b(20\d{2}[a-z][a-z0-9]{2,})\b/i);
  if (keyMatch) return keyMatch[1].toLowerCase();

  const beforeReg = trimmed.match(
    /([A-Za-zÇçĞğİıÖöŞşÜü][A-Za-zÇçĞğİıÖöŞşÜü0-9\s\-]{1,44}?)\s*(?:regional|reg)\b/i
  );
  if (beforeReg) {
    let q = beforeReg[1].trim().replace(/^(?:şu|bu|the|for|için|icin|hakkında|hakkinda|about)\s+/i, "");
    q = q.replace(/\s+/g, " ").trim();
    if (q.length >= 2) return q;
  }

  const lower = text.toLowerCase();
  const hints = [
    "avrasya",
    "marmara",
    "istanbul",
    "ankara",
    "izmir",
    "tuis",
    "tuik",
    "türk",
    "turkiye",
    "turkey",
    "halic",
    "haliç",
  ];
  for (const h of hints) {
    if (lower.includes(h)) return h;
  }
  return null;
}

async function resolveEventFromRegionalQuery(
  query: string,
  year: number,
  apiKey: string
): Promise<{ key: string; name: string } | null> {
  if (!apiKey || !query) return null;
  const qTrim = query.trim();

  const direct = await fetch(`https://www.thebluealliance.com/api/v3/event/${encodeURIComponent(qTrim)}`, {
    headers: tbaAuthHeaders(apiKey),
  });
  if (direct.ok) {
    const j = await direct.json();
    if (j?.key && j?.name) return { key: j.key, name: j.name };
  }

  const qNorm = normalizeTbaSearch(qTrim);
  if (!qNorm || qNorm.length < 2) return null;

  const res = await fetch(`https://www.thebluealliance.com/api/v3/events/${year}`, {
    headers: tbaAuthHeaders(apiKey),
  });
  if (!res.ok) return null;
  const events: Array<{
    key: string;
    name: string;
    event_type?: number;
    start_date?: string;
    country?: string;
  }> = await res.json();

  const candidates = events.filter((e) => {
    const nn = normalizeTbaSearch(e.name);
    const kk = normalizeTbaSearch(e.key);
    return nn.includes(qNorm) || kk.includes(qNorm);
  });

  if (candidates.length === 0) return null;

  const preferRegional = candidates.filter((e) => e.event_type === TBA_EVENT_TYPE_REGIONAL);
  const pool = preferRegional.length > 0 ? preferRegional : candidates;
  pool.sort((a, b) => (b.start_date || "").localeCompare(a.start_date || ""));
  const best = pool[0];
  return { key: best.key, name: best.name };
}

/** Bir etkinlikteki tüm takımlar için qual + OPR özet tablosu (ittifak / regional analizi) */
async function buildEntireRegionalLeaderboardBlock(
  eventKey: string,
  apiKey: string,
  options: { maxRows: number }
): Promise<string> {
  const evRes = await fetch(`https://www.thebluealliance.com/api/v3/event/${encodeURIComponent(eventKey)}`, {
    headers: tbaAuthHeaders(apiKey),
  });
  const ev = evRes.ok ? await evRes.json() : null;
  const title = (ev?.name as string) || eventKey;

  const [rankRes, oprRes] = await Promise.all([
    fetch(`https://www.thebluealliance.com/api/v3/event/${encodeURIComponent(eventKey)}/rankings`, {
      headers: tbaAuthHeaders(apiKey),
    }),
    fetch(`https://www.thebluealliance.com/api/v3/event/${encodeURIComponent(eventKey)}/oprs`, {
      headers: tbaAuthHeaders(apiKey),
    }),
  ]);

  const rankData = rankRes.ok ? await rankRes.json() : null;
  const oprsData = oprRes.ok ? await oprRes.json() : null;
  const sortMeta: Array<{ name?: string }> = Array.isArray(rankData?.sort_order_info)
    ? rankData.sort_order_info
    : [];
  const rows: Array<{
    team_key?: string;
    rank?: number;
    record?: { wins?: number; losses?: number; ties?: number } | null;
    qual_average?: number | null;
    sort_orders?: number[];
  }> = Array.isArray(rankData?.rankings) ? rankData.rankings : [];

  if (rows.length === 0) {
    return (
      `\n\n=== REGIONAL / ETKİNLİK (TBA) ===\n` +
      `Etkinlik: ${title} (${eventKey})\n` +
      `Bu etkinlik için sıralama verisi henüz yok veya yayınlanmadı.\n` +
      `=== SON ===\n`
    );
  }

  const sortedRows = [...rows].sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
  const slice = sortedRows.slice(0, options.maxRows);
  const primaryMetric = sortMeta[0]?.name ?? "Sıra metriği 1";

  let out =
    `\n\n=== REGIONAL / ETKİNLİK — TÜM TAKIMLAR (TBA canlı) ===\n` +
    `Etkinlik adı: ${title}\n` +
    `event_key: ${eventKey}\n` +
    `Bu blok kullanıcıya özel olarak çözümlenmiştir — takım numarası sorma; kullanıcı vermedikçe ek takım isteme.\n` +
    `TUIS/TÜİK gibi kısaltmalar yerine bu resmi etkinlik adını ve sıralamayı kullan; kullanıcıya anlamsız kod soruları sorma.\n` +
    `Satır formatı: sıra | takım | W-L-T | qual skor ort. | ${primaryMetric} | OPR/DPR/CCWM\n\n`;

  for (const row of slice) {
    const tk = row.team_key || "";
    const num = tk.replace(/^frc/i, "");
    const rec = row.record;
    const wlt = rec ? `${rec.wins}-${rec.losses}-${rec.ties}` : "?";
    const qa = row.qual_average != null ? String(row.qual_average) : "?";
    const m1 =
      Array.isArray(row.sort_orders) && row.sort_orders.length > 0 ? String(row.sort_orders[0]) : "?";
    const opr = formatOprStatsOnly(oprsData, tk);
    out += `#${row.rank ?? "?"} | ${num} | ${wlt} | ${qa} | ${m1} | ${opr || "-"}\n`;
  }

  if (sortedRows.length > slice.length) {
    out += `\n(... ${sortedRows.length - slice.length} takım daha; özet için satır limiti)\n`;
  }
  out += `=== REGIONAL TABLO SONU ===\n`;
  return out;
}

/** TBA EventType: REGIONAL = 0 */
const TBA_EVENT_TYPE_REGIONAL = 0;
const MAX_EVENTS_FOR_MATCHES = 3;
const MAX_MATCH_LINES_PER_EVENT = 55;

function tbaAuthHeaders(apiKey: string): HeadersInit {
  return { "X-TBA-Auth-Key": apiKey, Accept: "application/json" };
}

/** Official FRC game names by competition year (update annually). */
function frcGameNameForYear(year: number): string {
  const games: Record<number, string> = {
    2026: "REBUILT (presented by Haas)",
    2025: "REEFSCAPE",
    2024: "Crescendo",
    2023: "Charged Up",
    2022: "Rapid React",
    2021: "INFINITE RECHARGE",
    2020: "INFINITE RECHARGE",
  };
  return games[year] ?? `FRC ${year} season (verify current name on firstinspires.org)`;
}

function formatPreviousSeasonsForPrompt(currentYear: number): string {
  const parts: string[] = [];
  for (let y = currentYear - 1; y >= currentYear - 4 && y >= 2000; y--) {
    parts.push(`${y}: ${frcGameNameForYear(y)}`);
  }
  return parts.join("; ");
}

function getAllianceTeamKeys(alliance: { team_keys?: string[]; teams?: string[] } | undefined): string[] {
  if (!alliance) return [];
  const raw = alliance.team_keys ?? alliance.teams;
  return Array.isArray(raw) ? raw : [];
}

function formatOneMatchLine(m: {
  comp_level?: string;
  match_number?: number;
  alliances?: Array<{ color?: string; team_keys?: string[]; teams?: string[]; score?: number }>;
}): string {
  const alliances = m.alliances;
  if (!alliances?.length) return "";
  const red = alliances.find((a) => a.color === "red");
  const blue = alliances.find((a) => a.color === "blue");
  const rs = red?.score ?? "?";
  const bs = blue?.score ?? "?";
  const rt = getAllianceTeamKeys(red)
    .map((k) => k.replace(/^frc/i, ""))
    .join("/");
  const bt = getAllianceTeamKeys(blue)
    .map((k) => k.replace(/^frc/i, ""))
    .join("/");
  const level = m.comp_level ?? "?";
  const num = m.match_number ?? "?";
  return `${level}${num}: [${rt}] ${rs} - ${bs} [${bt}]`;
}

function compLevelOrder(level: string | undefined): number {
  const o: Record<string, number> = { qm: 0, ef: 1, qf: 2, sf: 3, f: 4 };
  return level ? (o[level] ?? 50) : 50;
}

function selectMatchesForContext(
  matches: Array<Parameters<typeof formatOneMatchLine>[0]>
): Array<Parameters<typeof formatOneMatchLine>[0]> {
  const sorted = [...matches].sort((a, b) => {
    const c = compLevelOrder(a.comp_level) - compLevelOrder(b.comp_level);
    if (c !== 0) return c;
    return (a.match_number || 0) - (b.match_number || 0);
  });
  const qm = sorted.filter((m) => m.comp_level === "qm");
  const playoff = sorted.filter((m) => m.comp_level && m.comp_level !== "qm");
  const maxQm = Math.max(0, MAX_MATCH_LINES_PER_EVENT - playoff.length);
  const qmPick = qm.length <= maxQm ? qm : qm.slice(-maxQm);
  return [...qmPick, ...playoff];
}

type TbaOprsPayload = {
  oprs?: Record<string, number>;
  dprs?: Record<string, number>;
  ccwms?: Record<string, number>;
};

function formatOprStatsOnly(oprsPayload: TbaOprsPayload | null | undefined, teamKey: string): string {
  if (!oprsPayload) return "";
  const opr = oprsPayload.oprs?.[teamKey];
  const dpr = oprsPayload.dprs?.[teamKey];
  const ccwm = oprsPayload.ccwms?.[teamKey];
  const parts: string[] = [];
  if (typeof opr === "number" && !Number.isNaN(opr)) parts.push(`OPR ${opr.toFixed(2)}`);
  if (typeof dpr === "number" && !Number.isNaN(dpr)) parts.push(`DPR ${dpr.toFixed(2)}`);
  if (typeof ccwm === "number" && !Number.isNaN(ccwm)) parts.push(`CCWM ${ccwm.toFixed(2)}`);
  return parts.join(", ");
}

function formatOprTriple(oprsPayload: TbaOprsPayload | null | undefined, teamKey: string): string {
  const s = formatOprStatsOnly(oprsPayload, teamKey);
  return s ? `TBA güç skorları (aynı etkinlik): ${s}` : "";
}

/** TBA `/event/{key}/alliances` — eleme ittifakları (çoğu regionalde 8); her biri ayrı yorumlanmalı */
async function buildPlayoffEightAlliancesBlock(eventKey: string, apiKey: string): Promise<string> {
  const res = await fetch(
    `https://www.thebluealliance.com/api/v3/event/${encodeURIComponent(eventKey)}/alliances`,
    { headers: tbaAuthHeaders(apiKey) }
  );
  if (!res.ok) return "";
  const alliances: unknown = await res.json();
  if (!Array.isArray(alliances) || alliances.length === 0) {
    return (
      `\n\n=== ELEME İTTİFAKLARI (TBA) ===\n` +
      `Bu etkinlik için eleme ittifakı listesi henüz yok (qual sonrası oluşur) veya TBA’de yok.\n` +
      `=== ELEME İTTİFAK SONU ===\n`
    );
  }

  const oprsRes = await fetch(
    `https://www.thebluealliance.com/api/v3/event/${encodeURIComponent(eventKey)}/oprs`,
    { headers: tbaAuthHeaders(apiKey) }
  );
  const oprsData = oprsRes.ok ? await oprsRes.json() : null;

  type AllianceRow = {
    name?: string;
    picks?: string[];
    status?: {
      record?: { wins?: number; losses?: number; ties?: number };
      playoff_average?: number | null;
    };
  };

  const sorted = [...(alliances as AllianceRow[])].sort((a, b) => {
    const na = parseInt(String(a?.name ?? "").replace(/\D/g, ""), 10) || 0;
    const nb = parseInt(String(b?.name ?? "").replace(/\D/g, ""), 10) || 0;
    return na - nb;
  });

  let out =
    `\n\n=== ELEME İTTİFAKLARI (TBA) — ${sorted.length} ittifak ===\n` +
    `Elemede tipik olarak **8 ittifak** olur. Aşağıda her ittifak ayrı bloktadır. ` +
    `Cevapta **listelenen her ittifak için ayrı ayrı** (Alliance 1 … Alliance 8 veya kaç tane varsa) kısa strateji yorumu ver; ` +
    `yalnızca qual sıralamasındaki ilk 3 takımla sınırlama.\n\n`;

  for (const al of sorted) {
    const aname = al.name ?? "?";
    const picks = Array.isArray(al.picks) ? al.picks : [];
    const teamNums = picks.map((k) => String(k).replace(/^frc/i, ""));
    out += `--- ${aname} ---\n`;
    out += `Takımlar (1. = alliance captain): ${teamNums.join(" | ")}\n`;
    const st = al.status;
    if (st?.record) {
      const r = st.record;
      out += `Eleme kaydı: ${r.wins ?? "?"}-${r.losses ?? "?"}-${r.ties ?? "?"}\n`;
    }
    if (st?.playoff_average != null && typeof st.playoff_average === "number") {
      out += `Eleme ortalama skor (TBA): ${st.playoff_average}\n`;
    }
    for (const tk of picks) {
      const bits = formatOprStatsOnly(oprsData, tk);
      if (bits) out += `  ${tk.replace(/^frc/i, "")}: ${bits}\n`;
    }
    out += "\n";
  }

  out += `=== ELEME İTTİFAKLARI SONU ===\n`;
  return out;
}

async function fetchEventRankingAndMetricsBlock(
  eventKey: string,
  teamKey: string,
  apiKey: string
): Promise<string> {
  const res = await fetch(`https://www.thebluealliance.com/api/v3/event/${eventKey}/rankings`, {
    headers: tbaAuthHeaders(apiKey),
  });
  if (!res.ok) return "";
  const data = await res.json();
  const sortMeta: Array<{ name?: string }> = Array.isArray(data?.sort_order_info) ? data.sort_order_info : [];
  const extraMeta: Array<{ name?: string }> = Array.isArray(data?.extra_stats_info) ? data.extra_stats_info : [];
  const rows: Array<{
    team_key?: string;
    rank?: number;
    record?: { wins?: number; losses?: number; ties?: number } | null;
    matches_played?: number;
    qual_average?: number | null;
    sort_orders?: number[];
    extra_stats?: number[];
  }> = Array.isArray(data?.rankings) ? data.rankings : [];

  const row = rows.find((r) => r.team_key === teamKey);
  if (!row) return "";

  const lines: string[] = [];
  const rank = row.rank ?? "?";
  const rec = row.record;
  const w = rec?.wins ?? "?";
  const l = rec?.losses ?? "?";
  const t = rec?.ties ?? "?";
  lines.push(`Sıralama (qual): #${rank} — kayıt ${w}-${l}-${t}`);
  if (row.matches_played != null) lines.push(`Oynanan qual maçı: ${row.matches_played}`);
  if (row.qual_average != null && row.qual_average !== undefined) {
    lines.push(`Qual maç skor ortalaması (TBA): ${row.qual_average}`);
  }

  const so = row.sort_orders;
  if (Array.isArray(so) && sortMeta.length > 0) {
    const parts: string[] = [];
    for (let i = 0; i < Math.min(so.length, sortMeta.length, 6); i++) {
      const name = sortMeta[i]?.name;
      if (name != null) parts.push(`${name}: ${so[i]}`);
    }
    if (parts.length) lines.push(`Sıralama metrikleri: ${parts.join("; ")}`);
  }

  const es = row.extra_stats;
  if (Array.isArray(es) && extraMeta.length > 0) {
    const parts: string[] = [];
    for (let i = 0; i < Math.min(es.length, extraMeta.length, 4); i++) {
      const name = extraMeta[i]?.name;
      if (name != null) parts.push(`${name}: ${es[i]}`);
    }
    if (parts.length) lines.push(`Ek istatistikler: ${parts.join("; ")}`);
  }

  try {
    const opRes = await fetch(`https://www.thebluealliance.com/api/v3/event/${eventKey}/oprs`, {
      headers: tbaAuthHeaders(apiKey),
    });
    if (opRes.ok) {
      const oprsJson = await opRes.json();
      const oprLine = formatOprTriple(oprsJson, teamKey);
      if (oprLine) lines.push(oprLine);
    }
  } catch {
    /* ignore */
  }

  return lines.join("\n");
}

/** Aynı etkinlikte birden fazla takım için TBA tabanlı ittifak / kıyaslama özeti */
async function buildAllianceSelectionComparisonBlock(
  teamNumbers: string[],
  currentYear: number,
  apiKey: string
): Promise<string> {
  if (teamNumbers.length < 2) return "";

  type Ev = { key?: string; name?: string; event_type?: number };
  const perTeam: { num: string; keySet: Set<string>; nameByKey: Map<string, string> }[] = [];

  for (const num of teamNumbers) {
    const res = await fetch(
      `https://www.thebluealliance.com/api/v3/team/frc${num}/events/${currentYear}`,
      { headers: tbaAuthHeaders(apiKey) }
    );
    const events: Ev[] = res.ok ? await res.json() : [];
    const regional = events.filter((e) => e.event_type === TBA_EVENT_TYPE_REGIONAL);
    const selected = regional.length > 0 ? regional : events;
    const keySet = new Set<string>();
    const nameByKey = new Map<string, string>();
    for (const e of selected) {
      if (e.key) {
        keySet.add(e.key);
        if (e.name) nameByKey.set(e.key, e.name);
      }
    }
    perTeam.push({ num, keySet, nameByKey });
  }

  let intersection = [...perTeam[0].keySet];
  for (let i = 1; i < perTeam.length; i++) {
    intersection = intersection.filter((k) => perTeam[i].keySet.has(k));
  }

  if (intersection.length === 0) {
    return (
      `\n\n=== İTTİFAK SEÇİMİ — ortak etkinlik (${currentYear}, TBA) ===\n` +
      `Bu mesajdaki takımlar ${currentYear} sezonunda TBA’de ortak bir etkinlik anahtarı paylaşmıyor gibi görünüyor. ` +
      `Qual skor ortalaması ve OPR’yi yalnızca aynı etkinlik içinde kıyasla; farklı regional’lerdeki OPR’ler doğrudan karşılaştırılmamalı.\n` +
      `=== İTTİFAK TBA SONU ===\n`
    );
  }

  const sharedKey = intersection[0];
  const eventName = perTeam[0].nameByKey.get(sharedKey) || sharedKey;

  const rankRes = await fetch(
    `https://www.thebluealliance.com/api/v3/event/${sharedKey}/rankings`,
    { headers: tbaAuthHeaders(apiKey) }
  );
  const oprsRes = await fetch(`https://www.thebluealliance.com/api/v3/event/${sharedKey}/oprs`, {
    headers: tbaAuthHeaders(apiKey),
  });
  const rankData = rankRes.ok ? await rankRes.json() : null;
  const oprsData = oprsRes.ok ? await oprsRes.json() : null;
  const rows: Array<{
    team_key?: string;
    rank?: number;
    record?: { wins?: number; losses?: number; ties?: number } | null;
    qual_average?: number | null;
    sort_orders?: number[];
  }> = Array.isArray(rankData?.rankings) ? rankData.rankings : [];
  const sortMeta: Array<{ name?: string }> = Array.isArray(rankData?.sort_order_info)
    ? rankData.sort_order_info
    : [];

  let out =
    `\n\n=== İTTİFAK SEÇİMİ — TBA karşılaştırma (aynı etkinlik: ${eventName} / ${sharedKey}) ===\n` +
    `Aşağıdaki qual skor ortalaması, sıra ve OPR/DPR/CCWM değerleri bu etkinlik için TBA’den gelir. ` +
    `İttifak yorumunu bu sayılara dayandır; OPR tek başına yeterli değildir, oyun rolü ve güvenilirlik de önemlidir.\n`;

  for (const num of teamNumbers) {
    const tk = `frc${num}`;
    const row = rows.find((r) => r.team_key === tk);
    out += `\n• Takım ${num}:`;
    if (row) {
      out += ` sıra #${row.rank ?? "?"}`;
      const rec = row.record;
      if (rec) out += ` (${rec.wins}-${rec.losses}-${rec.ties})`;
      if (row.qual_average != null) out += `; qual skor ort. ${row.qual_average}`;
      if (Array.isArray(row.sort_orders) && sortMeta[0]?.name != null) {
        out += `; ${sortMeta[0].name}: ${row.sort_orders[0]}`;
      }
    } else {
      out += " (bu etkinlikte sıralama satırı yok)";
    }
    const oprBits = formatOprStatsOnly(oprsData, tk);
    if (oprBits) out += ` | ${oprBits}`;
  }

  out += `\n=== İTTİFAK TBA SONU ===\n`;
  return out;
}

async function buildRegionalMatchesAndRankingsSection(
  teamKey: string,
  yearEvents: Array<{ key?: string; name?: string; event_type?: number }>,
  currentYear: number,
  apiKey: string
): Promise<string> {
  if (!yearEvents?.length) return "";

  let selected = yearEvents.filter((e) => e.event_type === TBA_EVENT_TYPE_REGIONAL);
  if (selected.length === 0) selected = [...yearEvents];
  selected = selected.slice(0, MAX_EVENTS_FOR_MATCHES);

  const blocks: string[] = [];
  for (const ev of selected) {
    const ek = ev.key;
    if (!ek) continue;
    const ename = ev.name || ek;
    let block = `\n\n📍 ${ename} (${ek})`;

    try {
      const rankBlock = await fetchEventRankingAndMetricsBlock(ek, teamKey, apiKey);
      if (rankBlock) block += `\n${rankBlock}`;
    } catch {
      /* ignore */
    }

    try {
      const mres = await fetch(
        `https://www.thebluealliance.com/api/v3/team/${teamKey}/event/${ek}/matches`,
        { headers: tbaAuthHeaders(apiKey) }
      );
      if (mres.ok) {
        const matches = await mres.json();
        const arr = Array.isArray(matches) ? matches : [];
        const picked = selectMatchesForContext(arr);
        const lines = picked.map((m) => formatOneMatchLine(m)).filter((l) => l.length > 0);
        if (lines.length > 0) {
          block += `\nMaçlar (özet, TBA):`;
          for (const line of lines) {
            block += `\n  ${line}`;
          }
        }
      }
    } catch {
      /* ignore */
    }

    blocks.push(block);
  }

  if (blocks.length === 0) return "";
  return (
    `\n\n=== MAÇ / SIRALAMA — Regional & etkinlik (The Blue Alliance, ${currentYear}) ===` +
    blocks.join("") +
    `\n=== MAÇ / SIRALAMA SONU ===`
  );
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
      { headers: tbaAuthHeaders(TBA_API_KEY) }
    );

    if (!teamResponse.ok) {
      console.log(`[TBA RAG] Takım ${teamNumber} bulunamadı (${teamResponse.status})`);
      return "";
    }

    const team = await teamResponse.json();
    const teamKey = team.key as string;

    const currentYear = new Date().getFullYear();

    let yearEvents: Array<{ key?: string; name?: string; event_type?: number }> = [];
    let recentEvents = "";
    try {
      const eventsResponse = await fetch(
        `https://www.thebluealliance.com/api/v3/team/frc${teamNumber}/events/${currentYear}`,
        { headers: tbaAuthHeaders(TBA_API_KEY) }
      );

      if (eventsResponse.ok) {
        yearEvents = await eventsResponse.json();
        if (yearEvents?.length > 0) {
          recentEvents = `\n- ${currentYear} Etkinlikleri: ${yearEvents
            .slice(0, 5)
            .map((e: { name?: string }) => e.name)
            .join(", ")}`;
        }
      }
    } catch {
      /* Etkinlik bilgisi yoksa devam et */
    }

    let regionalMatchesBlock = "";
    try {
      regionalMatchesBlock = await buildRegionalMatchesAndRankingsSection(
        teamKey,
        yearEvents,
        currentYear,
        TBA_API_KEY
      );
    } catch (e) {
      console.log(`[TBA RAG] Regional/maç çekerken hata:`, e);
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
            { headers: tbaAuthHeaders(TBA_API_KEY) }
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
- Website: ${team.website || "N/A"}${recentEvents}${regionalMatchesBlock}${awardsInfo}
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

      const currentYear = new Date().getFullYear();
      const tbaKey = process.env.TBA_API_KEY || "";

      // 1a. Regional adı / event_key → etkinlik çöz + (isteğe bağlı) tüm saha tablosu
      const allianceIntent = wantsAllianceSelectionContext(userText);
      const fullRegionalField = wantsEntireRegionalAnalysis(userText);
      const regionalQuery = extractRegionalSearchQuery(userText);

      let resolvedRegionalEvent: { key: string; name: string } | null = null;
      if (regionalQuery && tbaKey) {
        try {
          resolvedRegionalEvent = await resolveEventFromRegionalQuery(regionalQuery, currentYear, tbaKey);
          if (resolvedRegionalEvent) {
            console.log("[TBA RAG] Regional etkinlik çözümlendi:", resolvedRegionalEvent);
          }
        } catch (e) {
          console.log("[TBA RAG] Regional çözümleme hatası:", e);
        }
      }

      if (tbaKey && resolvedRegionalEvent) {
        try {
          const maxRows = fullRegionalField ? 85 : 24;
          const regBlock = await buildEntireRegionalLeaderboardBlock(resolvedRegionalEvent.key, tbaKey, {
            maxRows,
          });
          ragContext += regBlock;
          try {
            const playoffAlliancesBlock = await buildPlayoffEightAlliancesBlock(
              resolvedRegionalEvent.key,
              tbaKey
            );
            if (playoffAlliancesBlock) ragContext += playoffAlliancesBlock;
          } catch (e) {
            console.log("[TBA RAG] Eleme ittifakları hatası:", e);
          }
          ragContext +=
            `\nREGIONAL ÇÖZÜM: Etkinlik TBA üzerinden "${resolvedRegionalEvent.name}" (${resolvedRegionalEvent.key}) olarak eşleşti. ` +
            `Kullanıcı takım numarası vermediyse takım numarası isteme. "Tüm reg / tüm takımlar" istenmişse yukarıdaki tabloyu tüm saha analizi için kullan.\n` +
            `ELEME İTTİFAKLARI bloğu varsa (Alliance 1–8), ittifak stratejisinde **her ittifak için ayrı** yorum yap.\n`;
        } catch (e) {
          console.log("[TBA RAG] Regional tablo hatası:", e);
        }
      }

      // 1b. TBA RAG - Takım bilgileri (kullanıcı numara verdiyse)
      const teamNumbers = extractTeamNumbers(userText, allianceIntent ? 6 : 3);

      if (teamNumbers.length > 0) {
        console.log("Tespit edilen takımlar:", teamNumbers, "allianceIntent:", allianceIntent);

        // TBA'dan bilgi çek (paralel)
        const teamInfoPromises = teamNumbers.map((num) => fetchTeamInfo(num));
        const teamInfos = await Promise.all(teamInfoPromises);

        const validInfos = teamInfos.filter((info) => info.trim() !== "");

        if (validInfos.length > 0) {
          ragContext +=
            `\n\n=== GÜNCEL TAKIM BİLGİLERİ (The Blue Alliance - ${currentYear}) ===\n` +
            validInfos.join("\n") +
            `\n=== BİLGİ SONU ===\n\n` +
            `ÖNEMLİ: Yukarıdaki veriler The Blue Alliance'dan CANLI çekildi (${currentYear}). Bu GÜNCEL bilgileri kullan, eski eğitim verilerini değil!\n` +
            `ÖDÜLLER: Yukarıda 🏆 ile listelenen ödüller TBA API'den canlıdır. Ödül sorularında bu listeyi kullan.\n` +
            `MAÇ / SIRALAMA: "MAÇ / SIRALAMA" bölümündeki maç özetleri ve sıralama satırları TBA API'den canlıdır; maç veya regional performans sorularında bunları kullan.\n` +
            `SKOR / İTTİFAK: Sıralama bloklarında "Qual maç skor ortalaması", sıralama metrikleri ve OPR/DPR/CCWM TBA'dendir. İttifak seçimi yorumunda bu sayıları esas al; farklı etkinliklerdeki OPR'leri doğrudan kıyaslama.\n` +
            `İTTİFAK — ORTAK ETKİNLİK: İki veya daha fazla takım için "İTTİFAK SEÇİMİ" bölümü aynı etkinlikteki TBA karşılaştırmasını içerir (varsa).\n` +
            `REGIONAL TABLO: "REGIONAL / ETKİNLİK — TÜM TAKIMLAR" bölümü varsa ittifak ve sıralama sorularında önce onu kullan; kullanıcıdan gereksiz takım numarası isteme.`;

          if (tbaKey && teamNumbers.length >= 2) {
            try {
              const allianceBlock = await buildAllianceSelectionComparisonBlock(
                teamNumbers,
                currentYear,
                tbaKey
              );
              if (allianceBlock) ragContext += allianceBlock;
            } catch (e) {
              console.log("[TBA RAG] İttifak karşılaştırma hatası:", e);
            }
          }
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
- CALENDAR YEAR / SEASON FOCUS: ${currentYear}
- CURRENT FRC GAME (${currentYear}): ${frcGameNameForYear(currentYear)}
- Previous seasons (historical only — NOT the current game): ${formatPreviousSeasonsForPrompt(currentYear)}
- You receive CURRENT and LIVE data from the TBA API when present — do not treat training-cutoff years as "today"
- Team data may include: profile, ${currentYear} events, regional match summaries & rankings (qual match score average, sort metrics), OPR/DPR/CCWM per event, AWARDS (last 3 years), and a multi-team block for same-event alliance comparison when available

IMPORTANT RULES:
1. Be natural and helpful
2. Only answer the ASKED question - don't give irrelevant info
3. Don't repeat unnecessarily
4. Get straight to the point
5. When AWARDS are asked, use the LIVE award list from TBA
6. When MATCHES, SCORES, or REGIONAL performance are asked, use the LIVE match/ranking block from TBA when present
7. For ALLIANCE SELECTION or “who to pick”, base reasoning on TBA **qual average**, **rank**, **sort metrics**, and **OPR/DPR/CCWM** when present. Only compare OPR/CCWM across teams that appear in the **same event** block. Note OPR limitations (not perfect). If no shared-event block exists, say cross-event stats are not directly comparable and use each team’s own event data
8. When the RAG includes **REGIONAL / ETKİNLİK — TÜM TAKIMLAR** or **REGIONAL ÇÖZÜM**, the user already gave a regional (name or event key). Do **not** ask for team numbers or for obscure acronyms (e.g. “what is TUIS”). Use the resolved **event name** and **leaderboard** from context. If the user asked to analyze the **whole field**, use every row in that table (within limits) for commentary
9. When **ELEME İTTİFAKLARI (TBA)** is present, playoffs use up to **eight** alliances. Give **separate** commentary for **each** alliance listed (Alliance 1 through Alliance 8 or however many are shown)—not only three captains or top-ranked qual teams

DON'T:
❌ Give irrelevant information (STAY ON TOPIC!)
❌ Repeat the same thing over and over
❌ Explain topics that weren't asked about
❌ Give unnecessary background info
❌ Give old/estimated info when TBA data is available
❌ Call ${currentYear - 2} or ${currentYear - 1} the "current" game — the current competition year is ${currentYear}
❌ Ask for team numbers when the regional leaderboard block already lists all teams for that event
❌ Summarize alliance strategy using only three alliances when the context lists eight elimination alliances

DO:
✅ Answer the question
✅ Be clear and concise
✅ Provide code/examples when needed
✅ Explain sufficiently (not too little, not too much)
✅ Use current data from TBA for awards, matches, and rankings when provided

RESPOND IN ENGLISH.
` : `
SEN KİMSİN:
- FRC (FIRST Robotics Competition) konusunda uzman bir AI asistanısın
- The Blue Alliance ve WPILib dokümantasyonunu kullanırsın
- TAKVİM YILI / SEZON ODAĞI: ${currentYear}
- GÜNCEL FRC OYUNU (${currentYear}): ${frcGameNameForYear(currentYear)}
- Önceki sezonlar (sadece geçmiş — güncel oyun değil): ${formatPreviousSeasonsForPrompt(currentYear)}
- TBA API'den gelen CANLI veri varken eğitim kesim yılını "bugün" sanma
- Takım verisi şunları içerebilir: profil, ${currentYear} etkinlikleri, regional maç/sıralama özetleri, qual maç skor ortalaması, sıralama metrikleri, etkinlik bazlı OPR/DPR/CCWM, ÖDÜLLER (son 3 yıl) ve mümkünse aynı etkinlikte çoklu takım için TBA karşılaştırması

ÖNEMLİ KURALLAR:
1. Doğal ve yardımsever ol
2. Sadece SORULAN soruyu cevapla - alakasız bilgi verme
3. Gereksiz tekrar yapma
4. Direkt konuya gir
5. ÖDÜLLER sorulduğunda TBA'dan gelen CANLI ödül listesini kullan
6. MAÇ, SKOR veya REGIONAL performans sorulduğunda TBA'daki canlı maç/sıralama bölümünü kullan
7. İTTİFAK SEÇİMİ veya “kim daha iyi pick” sorularında TBA’deki **qual skor ortalaması**, **sıra**, **sıralama metrikleri** ve **OPR/DPR/CCWM** değerlerine dayan. OPR’yi yalnızca **aynı etkinlik** bloğundaki takımlar arasında kıyasla; farklı etkinliklerdeki OPR’ler doğrudan kıyaslanmaz. OPR’nin mutlak doğru olmadığını kısaca belirtebilirsin. Ortak etkinlik yoksa bunu söyle ve her takımın kendi regional verisini kullan
8. RAG’de **REGIONAL / ETKİNLİK — TÜM TAKIMLAR** veya **REGIONAL ÇÖZÜM** varsa kullanıcı regional adı veya event_key vermiş demektir; **takım numarası sorma**, TUIS/TÜİK gibi anlamsız kod soruları sorma. Çözümlenen **etkinlik adını** ve **tablo satırlarını** kullan. Kullanıcı “tüm reg / tüm takımlar” dediyse tablodaki **tüm satırlara** dayanarak analiz ver
9. **ELEME İTTİFAKLARI (TBA)** bloğu varsa elemede genelde **8 ittifak** vardır; **her bir ittifak (Alliance 1 … 8 veya listedeki kadarı) için ayrı ayrı** kısa strateji yorumu ver. Sadece qual’deki ilk 3 takım veya 3 ittifak ile yetinme

YAPMA:
❌ Alakasız bilgi verme (SORULAN KONU DIŞINA ÇIKMA!)
❌ Aynı şeyi tekrar tekrar söyleme
❌ Soru sorulmamış konuları açıklama
❌ Gereksiz ön bilgi verme
❌ TBA verisi varken eski/tahmin bilgi verme
❌ ${currentYear - 2} veya ${currentYear - 1} oyununu "şu anki sezon" diye gösterme — güncel yarışma yılı ${currentYear}
❌ Regional tablo zaten listelenmişken kullanıcıdan tekrar takım numarası isteme
❌ 8 eleme ittifakı veri olarak varken yalnızca üç ittifak/kaptan üzerinden özet geçme

YAP:
✅ Soruyu cevapla
✅ Net ve anlaşılır ol
✅ Gerekirse kod/örnek ver
✅ Yeterince açıkla (az değil, çok değil)
✅ Ödül, maç ve sıralama için TBA'dan gelen güncel veriyi kullan

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
    // Hiz: gemini-2.5-flash (stabil) veya gemini-1.5-flash
    const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    
    // API Key debug - sadece development'ta
    if (process.env.NODE_ENV === 'development') {
      console.log("=== GEMINI API DEBUG INFO ===");
      console.log("Model:", GEMINI_MODEL);
      console.log("API Key exists:", !!GEMINI_API_KEY);
      console.log("=== END DEBUG ===");
    }
    
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { 
          error: "GEMINI_API_KEY bulunamadı. Lütfen environment variable'ı ayarlayın.",
        }, 
        { status: 500 }
      );
    }

    // Google Generative AI SDK kullan
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    // Gemini için mesaj formatını hazırla
    // Gemini API için system instruction ve conversation history'yi birleştir
    const systemInstruction = systemPrompt + ragContext;
    
    // Son mesajları Gemini formatına dönüştür
    // Son mesajları al: En son 3 mesaj tutulacak (sliding window)
    const lastMessages = messages.slice(-3); // Son 3 mesajı al
    
    // Gemini için mesaj formatı: role ve parts içeriyor
    const contents: any[] = [];
    
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

    // Retry mekanizması - 3 deneme
    let lastError: any = null;
    let result: any = null;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Model'i al
        const model = genAI.getGenerativeModel({ 
          model: GEMINI_MODEL,
          systemInstruction: systemInstruction.trim() || undefined,
        });

        // Timeout ekle (30 saniye per attempt)
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(
            () => reject(new Error('Gemini API timeout: 120 saniye içinde yanıt alınamadı.')),
            120000
          );
        });

        // Generate content with timeout
        const generatePromise = model.generateContent({
          contents: contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          }
        });

        result = await Promise.race([generatePromise, timeoutPromise]);
        
        // Başarılı oldu, retry loop'tan çık
        break;
      } catch (apiError: any) {
        lastError = apiError;
        
        // Rate limit veya timeout ise retry yap
        const isRetryable = 
          apiError.message?.includes('timeout') ||
          apiError.message?.includes('429') ||
          apiError.message?.includes('rate limit') ||
          apiError.message?.includes('503') ||
          apiError.message?.includes('500') ||
          apiError.message?.includes('ECONNREFUSED') ||
          apiError.message?.includes('network');
        
        if (isRetryable && attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.log(`[Gemini API] Attempt ${attempt} failed, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // Retry yapılamazsa veya son deneme ise hata fırlat
        throw apiError;
      }
    }
    
    if (!result) {
      throw lastError || new Error('Gemini API yanıt veremedi.');
    }

    try {
      const response = result.response;

      // Response'dan text'i çıkar
      let aiResponse = "";
      
      try {
        aiResponse = response.text();
      } catch (textError: any) {
        // Eğer text() metodu hata verirse, candidates'ı kontrol et
        const candidates = response.candidates;
        if (candidates && candidates.length > 0) {
          const candidate = candidates[0];
          
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
      }

      if (!aiResponse) {
        // Eğer hiç yanıt yoksa, safety blocked olabilir
        const promptFeedback = result.response.promptFeedback;
        if (promptFeedback?.blockReason) {
          aiResponse = `Üzgünüm, mesajınız güvenlik nedeniyle engellendi: ${promptFeedback.blockReason}. Lütfen mesajınızı yeniden formüle edin.`;
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

    } catch (apiError: any) {
      console.error("Gemini API Error:", apiError);
      let errorMessage = "Gemini API hatası";
      
      // Hata mesajını kontrol et
      if (apiError.message) {
        if (apiError.message.includes("API key") || apiError.message.includes("401") || apiError.message.includes("403")) {
          errorMessage = "Gemini API key geçersiz veya yetkisiz. Lütfen GEMINI_API_KEY'i kontrol edin.";
        } else if (apiError.message.includes("429") || apiError.message.includes("rate limit")) {
          errorMessage = "API rate limit aşıldı. Lütfen birkaç dakika bekleyin.";
        } else if (apiError.message.includes("500") || apiError.message.includes("503")) {
          errorMessage = "Gemini servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.";
        } else {
          errorMessage = `Gemini API hatası: ${apiError.message}`;
        }
      }
      
      return NextResponse.json(
        { 
          error: errorMessage, 
          details: apiError.message,
        }, 
        { status: 500 }
      );
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
