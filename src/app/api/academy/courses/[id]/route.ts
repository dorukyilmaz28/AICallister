import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/database";
import { getCourse, getUserProgress } from "@/lib/academy-api";

// GET /api/academy/courses/[id] - Get course details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: courseId } = await params;

    // Not: Mevcut Academy sitesinde API yok, sadece local database kullanıyoruz
    // Eğer ileride API eklerseniz, aşağıdaki kodu aktif edebilirsiniz:
    // const academyCourse = await getCourse(courseId, session?.user?.id);
    // if (academyCourse) { ... }

    // Local database'den kursu çek
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          where: { isPublished: true },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Kurs bulunamadı." },
        { status: 404 }
      );
    }

    if (!course.isPublished && session?.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Bu kurs yayınlanmamış." },
        { status: 403 }
      );
    }

    // Get user progress if logged in
    let userProgress = null;
    if (session?.user?.id) {
      userProgress = await prisma.userCourseProgress.findUnique({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId: course.id,
          },
        },
      });

      // Get lesson progress
      const lessonProgress = await prisma.userLessonProgress.findMany({
        where: {
          userId: session.user.id,
          lessonId: {
            in: course.lessons.map((l) => l.id),
          },
        },
      });

      return NextResponse.json({
        course,
        userProgress,
        lessonProgress,
      });
    }

    return NextResponse.json({ course });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Kurs yüklenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

