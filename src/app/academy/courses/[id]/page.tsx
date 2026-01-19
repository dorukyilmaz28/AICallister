"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  CheckCircle,
  Circle,
  ArrowLeft,
  Play,
} from "lucide-react";
import Loading from "@/components/Loading";
import ReactMarkdown from "react-markdown";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  content: string;
  videoUrl: string | null;
  duration: number | null;
  order: number;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string;
  level: string;
  duration: number | null;
  lessons: Lesson[];
}

interface LessonProgress {
  lessonId: string;
  isCompleted: boolean;
}

export const dynamic = 'force-static';

export async function generateStaticParams() {
  // Static export için boş array döndür (dynamic route'lar çalışmayacak)
  return [];
}

export default function CourseDetailPage() {
  const { session } = useAuthGuard({ requireAuth: false });
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [userProgress, setUserProgress] = useState<{
    progress: number;
  } | null>(null);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId, session]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/academy/courses/${courseId}`);
      const data = await response.json();
      setCourse(data.course);
      setUserProgress(data.userProgress);
      setLessonProgress(data.lessonProgress || []);
    } catch (error) {
      console.error("Error fetching course:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return lessonProgress.some(
      (lp) => lp.lessonId === lessonId && lp.isCompleted
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Kurs bulunamadı.</p>
          <Link
            href="/academy"
            className="text-purple-600 hover:text-purple-700 font-semibold"
          >
            Akademiye Dön
          </Link>
        </div>
      </div>
    );
  }

  const progress = userProgress?.progress || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <Link
          href="/academy"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Akademiye Dön</span>
        </Link>

        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {course.title}
            </h1>
            <p className="text-gray-600 text-lg">{course.description}</p>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
              {course.category}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              {course.level}
            </span>
            {course.duration && (
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{course.duration} dakika</span>
              </div>
            )}
          </div>

          {session && progress > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 font-semibold">İlerleme</span>
                <span className="font-bold text-gray-900">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-purple-600 h-3 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="border-t pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Dersler ({course.lessons.length})
            </h2>
            <div className="space-y-3">
              {course.lessons.map((lesson, index) => {
                const completed = isLessonCompleted(lesson.id);
                return (
                  <Link
                    key={lesson.id}
                    href={`/academy/lessons/${lesson.id}`}
                    className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                  >
                    <div className="flex-shrink-0">
                      {completed ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <Circle className="h-6 w-6 text-gray-400 group-hover:text-purple-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-500">
                          Ders {index + 1}
                        </span>
                        {lesson.duration && (
                          <span className="text-xs text-gray-400">
                            • {lesson.duration} dk
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {lesson.title}
                      </h3>
                      {lesson.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                          {lesson.description}
                        </p>
                      )}
                    </div>
                    <Play className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


