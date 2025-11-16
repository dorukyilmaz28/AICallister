import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/database";
import { randomBytes } from "crypto";

// GET: Tek bir snippet getir
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    const snippet = await prisma.codeSnippet.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        favorites: session?.user?.id ? {
          where: {
            userId: session.user.id
          }
        } : false,
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

    // Public değilse ve kullanıcı sahibi değilse erişim yok
    if (!snippet.isPublic && snippet.userId !== session?.user?.id) {
      return NextResponse.json(
        { error: "Bu snippet'e erişim yetkiniz yok." },
        { status: 403 }
      );
    }

    // View count'u artır
    await prisma.codeSnippet.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });

    return NextResponse.json({
      snippet: {
        ...snippet,
        favoriteCount: snippet._count.favorites,
        isFavorite: snippet.favorites && snippet.favorites.length > 0,
        // Seed edilmiş (admin tarafından oluşturulmuş) snippet'lerde silme izni verme
        isDeletable: !!session?.user?.id 
          && snippet.userId === session.user.id 
          && snippet.user.role !== "admin"
      }
    });

  } catch (error: any) {
    console.error("Error fetching snippet:", error);
    return NextResponse.json(
      { error: "Snippet yüklenirken hata oluştu." },
      { status: 500 }
    );
  }
}

// PUT: Snippet güncelle
export async function PUT(
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

    if (snippet.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Bu snippet'i düzenleme yetkiniz yok." },
        { status: 403 }
      );
    }

    const { title, description, code, language, category, tags, isPublic } = await req.json();

    const updatedSnippet = await prisma.codeSnippet.update({
      where: { id },
      data: {
        title: title || snippet.title,
        description: description !== undefined ? description : snippet.description,
        code: code || snippet.code,
        language: language || snippet.language,
        category: category || snippet.category,
        tags: tags || snippet.tags,
        isPublic: isPublic !== undefined ? isPublic : snippet.isPublic,
        shareToken: isPublic && !snippet.shareToken ? randomBytes(16).toString("hex") : snippet.shareToken
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ snippet: updatedSnippet });

  } catch (error: any) {
    console.error("Error updating snippet:", error);
    return NextResponse.json(
      { error: "Snippet güncellenirken hata oluştu." },
      { status: 500 }
    );
  }
}

// DELETE: Snippet sil
export async function DELETE(
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

    if (snippet.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Bu snippet'i silme yetkiniz yok." },
        { status: 403 }
      );
    }

    await prisma.codeSnippet.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Snippet başarıyla silindi." });

  } catch (error: any) {
    console.error("Error deleting snippet:", error);
    return NextResponse.json(
      { error: "Snippet silinirken hata oluştu." },
      { status: 500 }
    );
  }
}

