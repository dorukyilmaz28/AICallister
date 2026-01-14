import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/database";
import { randomBytes } from "crypto";

// GET: Konuşmayı Markdown olarak export et
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "markdown"; // markdown veya json

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
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
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Konuşma bulunamadı." },
        { status: 404 }
      );
    }

    if (conversation.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Bu konuşmaya erişim yetkiniz yok." },
        { status: 403 }
      );
    }

    if (format === "json") {
      return NextResponse.json({
        conversation: {
          id: conversation.id,
          title: conversation.title,
          context: conversation.context,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
          user: conversation.user,
          messages: conversation.messages
        }
      });
    }

    // Markdown format
    let markdown = `# ${conversation.title || "Konuşma"}\n\n`;
    markdown += `**Bağlam:** ${conversation.context}\n`;
    markdown += `**Oluşturulma:** ${new Date(conversation.createdAt).toLocaleString("tr-TR")}\n`;
    markdown += `**Güncellenme:** ${new Date(conversation.updatedAt).toLocaleString("tr-TR")}\n\n`;
    markdown += `---\n\n`;

    conversation.messages.forEach((message, index) => {
      const role = message.role === "user" ? "👤 Kullanıcı" : "🤖 AI Asistan";
      markdown += `## ${role}\n\n`;
      
      // Markdown içeriğini temizle (zaten markdown formatında)
      let content = message.content;
      markdown += `${content}\n\n`;
      markdown += `*${new Date(message.createdAt).toLocaleString("tr-TR")}*\n\n`;
      markdown += `---\n\n`;
    });

    return new NextResponse(markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="conversation-${id}.md"`
      }
    });

  } catch (error: any) {
    console.error("Error exporting conversation:", error);
    return NextResponse.json(
      { error: "Konuşma export edilirken hata oluştu." },
      { status: 500 }
    );
  }
}

