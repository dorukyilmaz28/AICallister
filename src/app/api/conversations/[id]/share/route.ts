import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/database";
import { randomBytes } from "crypto";

// POST: Paylaşım linki oluştur
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

    const conversation = await prisma.conversation.findUnique({
      where: { id }
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Konuşma bulunamadı." },
        { status: 404 }
      );
    }

    if (conversation.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Bu konuşmayı paylaşma yetkiniz yok." },
        { status: 403 }
      );
    }

    const { expiresInDays } = await req.json().catch(() => ({}));
    const expiresAt = expiresInDays 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    // Mevcut paylaşım var mı kontrol et
    let share = await prisma.conversationShare.findFirst({
      where: {
        conversationId: id,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });

    if (!share) {
      // Yeni paylaşım oluştur
      const shareToken = randomBytes(16).toString("hex");
      share = await prisma.conversationShare.create({
        data: {
          conversationId: id,
          shareToken,
          isActive: true,
          expiresAt
        }
      });
    }

    const baseUrl = process.env.NEXTAUTH_URL || req.headers.get("origin") || "http://localhost:3000";
    const shareUrl = `${baseUrl}/conversations/share/${share.shareToken}`;

    return NextResponse.json({
      shareToken: share.shareToken,
      shareUrl,
      expiresAt: share.expiresAt,
      viewCount: share.viewCount
    });

  } catch (error: any) {
    console.error("Error creating share link:", error);
    return NextResponse.json(
      { error: "Paylaşım linki oluşturulurken hata oluştu." },
      { status: 500 }
    );
  }
}

// GET: Paylaşım linklerini listele
export async function GET(
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

    const conversation = await prisma.conversation.findUnique({
      where: { id }
    });

    if (!conversation || conversation.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Bu konuşmaya erişim yetkiniz yok." },
        { status: 403 }
      );
    }

    const shares = await prisma.conversationShare.findMany({
      where: {
        conversationId: id
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    const baseUrl = process.env.NEXTAUTH_URL || req.headers.get("origin") || "http://localhost:3000";
    const formattedShares = shares.map(share => ({
      ...share,
      shareUrl: `${baseUrl}/conversations/share/${share.shareToken}`
    }));

    return NextResponse.json({ shares: formattedShares });

  } catch (error: any) {
    console.error("Error fetching shares:", error);
    return NextResponse.json(
      { error: "Paylaşım linkleri yüklenirken hata oluştu." },
      { status: 500 }
    );
  }
}

// DELETE: Paylaşım linkini iptal et
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const shareToken = searchParams.get("token");

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    if (!shareToken) {
      return NextResponse.json(
        { error: "Share token gereklidir." },
        { status: 400 }
      );
    }

    const share = await prisma.conversationShare.findUnique({
      where: { shareToken },
      include: {
        conversation: true
      }
    });

    if (!share || share.conversation.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Bu paylaşım linkini iptal etme yetkiniz yok." },
        { status: 403 }
      );
    }

    await prisma.conversationShare.update({
      where: { shareToken },
      data: {
        isActive: false
      }
    });

    return NextResponse.json({ message: "Paylaşım linki iptal edildi." });

  } catch (error: any) {
    console.error("Error deleting share:", error);
    return NextResponse.json(
      { error: "Paylaşım linki iptal edilirken hata oluştu." },
      { status: 500 }
    );
  }
}

