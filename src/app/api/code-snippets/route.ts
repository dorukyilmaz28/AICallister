import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/database";
import { randomBytes } from "crypto";

// GET: Tüm snippet'leri getir (public ve kullanıcının kendi snippet'leri)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const language = searchParams.get("language");
    const search = searchParams.get("search");
    const onlyPublic = searchParams.get("public") === "true";

    const where: any = {};

    if (onlyPublic) {
      where.isPublic = true;
    } else if (session?.user?.id) {
      // Kullanıcının kendi snippet'leri veya public snippet'ler
      where.OR = [
        { userId: session.user.id },
        { isPublic: true }
      ];
    } else {
      // Giriş yapmamışsa sadece public snippet'ler
      where.isPublic = true;
    }

    if (category) {
      where.category = category;
    }

    if (language) {
      where.language = language;
    }

    if (search) {
      where.OR = [
        ...(where.OR || []),
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { hasSome: [search] } }
      ];
    }

    const snippets = await prisma.codeSnippet.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
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
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    const formattedSnippets = snippets.map(snippet => ({
      ...snippet,
      favoriteCount: snippet._count.favorites,
      isFavorite: snippet.favorites && snippet.favorites.length > 0
    }));

    return NextResponse.json({ snippets: formattedSnippets });

  } catch (error: any) {
    console.error("Error fetching snippets:", error);
    return NextResponse.json(
      { error: "Snippet'ler yüklenirken hata oluştu." },
      { status: 500 }
    );
  }
}

// POST: Yeni snippet oluştur
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const { title, description, code, language, category, tags, isPublic } = await req.json();

    if (!title || !code || !language || !category) {
      return NextResponse.json(
        { error: "Başlık, kod, dil ve kategori gereklidir." },
        { status: 400 }
      );
    }

    // Share token oluştur (eğer public ise)
    const shareToken = isPublic ? randomBytes(16).toString("hex") : null;

    const snippet = await prisma.codeSnippet.create({
      data: {
        title,
        description: description || null,
        code,
        language,
        category,
        tags: tags || [],
        isPublic: isPublic || false,
        shareToken,
        userId: session.user.id
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

    return NextResponse.json({ snippet }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating snippet:", error);
    return NextResponse.json(
      { error: "Snippet oluşturulurken hata oluştu." },
      { status: 500 }
    );
  }
}

