import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/database";

// POST: Snippet'i favorilere ekle/çıkar
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const snippet = await prisma.codeSnippet.findUnique({
      where: { id }
    });

    if (!snippet) {
      return NextResponse.json(
        { error: "Snippet bulunamadı." },
        { status: 404 }
      );
    }

    // Favori var mı kontrol et
    const existingFavorite = await prisma.userFavoriteSnippet.findUnique({
      where: {
        userId_snippetId: {
          userId: session.user.id,
          snippetId: id
        }
      }
    });

    if (existingFavorite) {
      // Favoriden çıkar
      await prisma.userFavoriteSnippet.delete({
        where: {
          id: existingFavorite.id
        }
      });

      // Favorite count'u azalt
      await prisma.codeSnippet.update({
        where: { id },
        data: {
          favoriteCount: {
            decrement: 1
          }
        }
      });

      return NextResponse.json({ isFavorite: false, message: "Favorilerden çıkarıldı." });
    } else {
      // Favorilere ekle
      await prisma.userFavoriteSnippet.create({
        data: {
          userId: session.user.id,
          snippetId: id
        }
      });

      // Favorite count'u artır
      await prisma.codeSnippet.update({
        where: { id },
        data: {
          favoriteCount: {
            increment: 1
          }
        }
      });

      return NextResponse.json({ isFavorite: true, message: "Favorilere eklendi." });
    }

  } catch (error: any) {
    console.error("Error toggling favorite:", error);
    return NextResponse.json(
      { error: "Favori işlemi sırasında hata oluştu." },
      { status: 500 }
    );
  }
}

