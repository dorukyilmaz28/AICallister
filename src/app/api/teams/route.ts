import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Takım oluşturma
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const { name, description, teamNumber } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Takım adı gereklidir." },
        { status: 400 }
      );
    }

    // Takım oluştur
    const team = await prisma.team.create({
      data: {
        name,
        description,
        teamNumber,
        members: {
          create: {
            userId: session.user.id,
            role: "captain", // Takım oluşturan kişi otomatik olarak kaptan olur
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      team,
      message: "Takım başarıyla oluşturuldu.",
    });

  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { error: "Takım oluşturulurken hata oluştu." },
      { status: 500 }
    );
  }
}

// Kullanıcının takımlarını getir
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 }
      );
    }

    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            chats: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({
      teams,
    });

  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "Takımlar yüklenirken hata oluştu." },
      { status: 500 }
    );
  }
}
