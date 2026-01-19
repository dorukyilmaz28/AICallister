import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/database";
import { getCourses } from "@/lib/academy-api";

// Force dynamic rendering (Vercel serverless function)
export const dynamic = 'force-dynamic';

// GET /api/academy/courses - Get all published courses
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Not: Mevcut Academy sitesinde API yok, sadece local database kullanıyoruz
    // Eğer ileride API eklerseniz, aşağıdaki kodu aktif edebilirsiniz:
    // const academyCourses = await getCourses(session?.user?.id);
    // if (academyCourses.length > 0) {
    //   return NextResponse.json({ courses: academyCourses });
    // }
    
    // Local database'den kursları çek
    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
      },
      include: {
        lessons: {
          where: { isPublished: true },
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            duration: true,
            order: true,
          },
        },
        _count: {
          select: {
            lessons: {
              where: { isPublished: true },
            },
          },
        },
      },
      orderBy: { order: "asc" },
    });

    // If user is logged in, include progress
    if (session?.user?.id) {
      const coursesWithProgress = await Promise.all(
        courses.map(async (course) => {
          const progress = await prisma.userCourseProgress.findUnique({
            where: {
              userId_courseId: {
                userId: session.user.id,
                courseId: course.id,
              },
            },
          });

          return {
            ...course,
            userProgress: progress,
          };
        })
      );

      return NextResponse.json({ courses: coursesWithProgress });
    }

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Kurslar yüklenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// POST /api/academy/courses - Create new course (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Yetkiniz yok." },
        { status: 403 }
      );
    }

    const { title, description, thumbnail, category, level, duration, order } =
      await req.json();

    if (!title || !category || !level) {
      return NextResponse.json(
        { error: "Başlık, kategori ve seviye zorunludur." },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        thumbnail,
        category,
        level,
        duration,
        order: order || 0,
        isPublished: false,
      },
    });

    return NextResponse.json({ course });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Kurs oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}

