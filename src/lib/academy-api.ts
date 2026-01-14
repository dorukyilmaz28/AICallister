/**
 * FRC Academy API Client
 * Mevcut Academy sitesine bağlanmak için kullanılır
 */

const ACADEMY_API_URL = process.env.ACADEMY_API_URL || "https://frcacademy.com/api";
const ACADEMY_BASE_URL = process.env.ACADEMY_BASE_URL || "https://frcacademy.com";

interface AcademyCourse {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  category: string;
  level: string;
  duration: number | null;
  isPublished: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  lessons?: AcademyLesson[];
}

interface AcademyLesson {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  content: string;
  videoUrl: string | null;
  duration: number | null;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AcademyUserProgress {
  courseId: string;
  lessonId?: string;
  progress: number;
  isCompleted: boolean;
  completedAt: string | null;
}

/**
 * Academy API'den kursları getir
 */
export async function getCourses(userId?: string): Promise<AcademyCourse[]> {
  try {
    const url = userId 
      ? `${ACADEMY_API_URL}/courses?userId=${userId}`
      : `${ACADEMY_API_URL}/courses`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Cache için next.js revalidate kullanılabilir
      next: { revalidate: 60 }, // 60 saniye cache
    });

    if (!response.ok) {
      throw new Error(`Academy API error: ${response.status}`);
    }

    const data = await response.json();
    return data.courses || data || [];
  } catch (error) {
    console.error("Error fetching courses from Academy:", error);
    // Fallback: local database'e dön
    return [];
  }
}

/**
 * Academy API'den kurs detayını getir
 */
export async function getCourse(courseId: string, userId?: string): Promise<AcademyCourse | null> {
  try {
    const url = userId
      ? `${ACADEMY_API_URL}/courses/${courseId}?userId=${userId}`
      : `${ACADEMY_API_URL}/courses/${courseId}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Academy API error: ${response.status}`);
    }

    const data = await response.json();
    return data.course || data || null;
  } catch (error) {
    console.error("Error fetching course from Academy:", error);
    return null;
  }
}

/**
 * Academy API'den ders detayını getir
 */
export async function getLesson(lessonId: string, userId?: string): Promise<AcademyLesson | null> {
  try {
    const url = userId
      ? `${ACADEMY_API_URL}/lessons/${lessonId}?userId=${userId}`
      : `${ACADEMY_API_URL}/lessons/${lessonId}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Academy API error: ${response.status}`);
    }

    const data = await response.json();
    return data.lesson || data || null;
  } catch (error) {
    console.error("Error fetching lesson from Academy:", error);
    return null;
  }
}

/**
 * Academy API'ye ilerleme gönder
 */
export async function updateProgress(
  userId: string,
  lessonId: string,
  isCompleted: boolean
): Promise<AcademyUserProgress | null> {
  try {
    const response = await fetch(`${ACADEMY_API_URL}/progress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Academy API authentication için gerekirse
        // "Authorization": `Bearer ${process.env.ACADEMY_API_KEY}`,
      },
      body: JSON.stringify({
        userId,
        lessonId,
        isCompleted,
      }),
    });

    if (!response.ok) {
      throw new Error(`Academy API error: ${response.status}`);
    }

    const data = await response.json();
    return data.progress || data || null;
  } catch (error) {
    console.error("Error updating progress in Academy:", error);
    return null;
  }
}

/**
 * Academy API'den kullanıcı ilerlemesini getir
 */
export async function getUserProgress(
  userId: string,
  courseId?: string
): Promise<AcademyUserProgress[]> {
  try {
    const url = courseId
      ? `${ACADEMY_API_URL}/progress?userId=${userId}&courseId=${courseId}`
      : `${ACADEMY_API_URL}/progress?userId=${userId}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      throw new Error(`Academy API error: ${response.status}`);
    }

    const data = await response.json();
    return data.progress || data || [];
  } catch (error) {
    console.error("Error fetching user progress from Academy:", error);
    return [];
  }
}

/**
 * Academy sitesine yönlendirme URL'i oluştur
 */
export function getAcademyUrl(path: string = ""): string {
  return `${ACADEMY_BASE_URL}${path}`;
}

/**
 * Mevcut Academy sitesine direkt yönlendirme yap
 * Eğer API yoksa, kullanıcıyı mevcut Academy sitesine yönlendir
 */
export function redirectToAcademy(path: string = "/html/main.html"): string {
  return `${ACADEMY_BASE_URL}${path}`;
}

export type { AcademyCourse, AcademyLesson, AcademyUserProgress };

