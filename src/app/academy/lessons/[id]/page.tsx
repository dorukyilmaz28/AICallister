"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  Play,
} from "lucide-react";
import Loading from "@/components/Loading";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  content: string;
  videoUrl: string | null;
  duration: number | null;
  order: number;
  course: {
    id: string;
    title: string;
  };
}

export default function LessonDetailPage() {
  const { session } = useAuthGuard({ requireAuth: false });
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [userProgress, setUserProgress] = useState<{
    isCompleted: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId, session]);

  const fetchLesson = async () => {
    try {
      const response = await fetch(`/api/academy/lessons/${lessonId}`);
      const data = await response.json();
      setLesson(data.lesson);
      setUserProgress(data.userProgress);
    } catch (error) {
      console.error("Error fetching lesson:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!session || isCompleting) return;

    setIsCompleting(true);
    try {
      const response = await fetch("/api/academy/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          isCompleted: !userProgress?.isCompleted,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserProgress(data.lessonProgress);
        // Refresh course progress
        if (lesson) {
          router.refresh();
        }
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Ders bulunamadı.</p>
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

  const isCompleted = userProgress?.isCompleted || false;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={`/academy/courses/${lesson.course.id}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{lesson.course.title}</span>
          </Link>
          {session && (
            <button
              onClick={handleComplete}
              disabled={isCompleting}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                isCompleted
                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                  : "bg-purple-100 text-purple-800 hover:bg-purple-200"
              }`}
            >
              <CheckCircle className="h-4 w-4" />
              {isCompleted ? "Tamamlandı" : "Tamamla"}
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {lesson.title}
            </h1>
            {lesson.description && (
              <p className="text-gray-600 text-lg mb-4">{lesson.description}</p>
            )}
            {lesson.duration && (
              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{lesson.duration} dakika</span>
              </div>
            )}
          </div>

          {lesson.videoUrl && (
            <div className="mb-8">
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <iframe
                  src={lesson.videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {lesson.content}
            </ReactMarkdown>
          </div>

          {session && (
            <div className="mt-8 pt-8 border-t flex items-center justify-between">
              <Link
                href={`/academy/courses/${lesson.course.id}`}
                className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Kursa Dön</span>
              </Link>
              <button
                onClick={handleComplete}
                disabled={isCompleting}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  isCompleted
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Tamamlandı</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Dersi Tamamla</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


