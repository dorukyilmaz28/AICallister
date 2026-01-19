import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";


// Force dynamic rendering (Vercel serverless function)
export const dynamic = 'force-dynamic';

// GET: Share token ile snippet getir (public erişim)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const snippet = await prisma.codeSnippet.findUnique({
      where: { shareToken: token },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            favorites: true
          }
        }
      }
    });

    if (!snippet) {
      return NextResponse.json(
        { error: "Snippet bulunamadı." },
        { status: 404 }
      );
    }

    if (!snippet.isPublic) {
      return NextResponse.json(
        { error: "Bu snippet public değil." },
        { status: 403 }
      );
    }

    // View count'u artır
    await prisma.codeSnippet.update({
      where: { id: snippet.id },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });

    return NextResponse.json({
      snippet: {
        ...snippet,
        favoriteCount: snippet._count.favorites
      }
    });

  } catch (error: any) {
    console.error("Error fetching shared snippet:", error);
    return NextResponse.json(
      { error: "Snippet yüklenirken hata oluştu." },
      { status: 500 }
    );
  }
}

