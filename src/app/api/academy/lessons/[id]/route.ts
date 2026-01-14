import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/database";
import { getLesson, getUserProgress } from "@/lib/academy-api";

// GET /api/academy/lessons/[id] - Get lesson details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: lessonId } = await params;

    // Not: Mevcut Academy sitesinde API yok, sadece local database kullanıyoruz
    // Eğer ileride API eklerseniz, aşağıdaki kodu aktif edebilirsiniz:
    // const academyLesson = await getLesson(lessonId, session?.user?.id);
    // if (academyLesson) { ... }

    // Local database'den dersi çek
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            isPublished: true,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Ders bulunamadı." },
        { status: 404 }
      );
    }

    if (!lesson.isPublished && session?.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Bu ders yayınlanmamış." },
        { status: 403 }
      );
    }

    // Get user progress if logged in
    let userProgress = null;
    if (session?.user?.id) {
      userProgress = await prisma.userLessonProgress.findUnique({
        where: {
          userId_lessonId: {
            userId: session.user.id,
            lessonId: lesson.id,
          },
        },
      });
    }

    return NextResponse.json({ lesson, userProgress });
  } catch (error) {
    console.error("Error fetching lesson:", error);
    return NextResponse.json(
      { error: "Ders yüklenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

