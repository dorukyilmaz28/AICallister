import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";


// Force dynamic rendering (Vercel serverless function)
export const dynamic = 'force-dynamic';

// GET: Paylaşım token'ı ile konuşmayı görüntüle (public)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const share = await prisma.conversationShare.findUnique({
      where: { shareToken: token },
      include: {
        conversation: {
          include: {
            messages: {
              orderBy: {
                createdAt: "asc"
              }
            },
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!share) {
      return NextResponse.json(
        { error: "Paylaşım linki bulunamadı." },
        { status: 404 }
      );
    }

    if (!share.isActive) {
      return NextResponse.json(
        { error: "Bu paylaşım linki artık aktif değil." },
        { status: 403 }
      );
    }

    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "Bu paylaşım linkinin süresi dolmuş." },
        { status: 403 }
      );
    }

    // View count'u artır
    await prisma.conversationShare.update({
      where: { shareToken: token },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });

    return NextResponse.json({
      conversation: share.conversation,
      share: {
        shareToken: share.shareToken,
        viewCount: share.viewCount + 1,
        createdAt: share.createdAt,
        expiresAt: share.expiresAt
      }
    });

  } catch (error: any) {
    console.error("Error fetching shared conversation:", error);
    return NextResponse.json(
      { error: "Konuşma yüklenirken hata oluştu." },
      { status: 500 }
    );
  }
}

