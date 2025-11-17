import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/database";
import { updateProgress } from "@/lib/academy-api";

// POST /api/academy/progress - Update lesson progress
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor." },
        { status: 401 }
      );
    }

    const { lessonId, isCompleted } = await req.json();

    if (!lessonId) {
      return NextResponse.json(
        { error: "Ders ID gerekli." },
        { status: 400 }
      );
    }

    // Not: Mevcut Academy sitesinde API yok, sadece local database kullanıyoruz
    // Eğer ileride API eklerseniz, aşağıdaki kodu aktif edebilirsiniz:
    // const academyProgress = await updateProgress(session.user.id, lessonId, isCompleted ?? true);
    // if (academyProgress) { return NextResponse.json({ lessonProgress: academyProgress }); }

    // Local database'e kaydet
    const lessonProgress = await prisma.userLessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId,
        },
      },
      update: {
        isCompleted: isCompleted ?? true,
        completedAt: isCompleted ? new Date() : null,
      },
      create: {
        userId: session.user.id,
        lessonId,
        isCompleted: isCompleted ?? true,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    // Get lesson to find course
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { courseId: true },
    });

    if (lesson) {
      // Calculate course progress
      const course = await prisma.course.findUnique({
        where: { id: lesson.courseId },
        include: {
          lessons: {
            where: { isPublished: true },
            select: { id: true },
          },
        },
      });

      if (course) {
        const completedLessons = await prisma.userLessonProgress.count({
          where: {
            userId: session.user.id,
            lessonId: {
              in: course.lessons.map((l) => l.id),
            },
            isCompleted: true,
          },
        });

        const totalLessons = course.lessons.length;
        const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

        // Update course progress
        await prisma.userCourseProgress.upsert({
          where: {
            userId_courseId: {
              userId: session.user.id,
              courseId: course.id,
            },
          },
          update: {
            progress,
            completedAt: progress === 100 ? new Date() : null,
          },
          create: {
            userId: session.user.id,
            courseId: course.id,
            progress,
            completedAt: progress === 100 ? new Date() : null,
          },
        });
      }
    }

    return NextResponse.json({ lessonProgress });
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { error: "İlerleme güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

