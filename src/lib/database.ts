import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// User işlemleri
export const userDb = {
  async create(userData: { name: string; email: string; password: string; teamNumber: string }) {
    // Email kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });
    
    if (existingUser) {
      throw new Error('Bu email adresi zaten kullanılıyor.');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    return await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        teamNumber: userData.teamNumber,
      }
    });
  },

  async findByEmail(email: string) {
    console.log("Looking for user with email:", email);
    const user = await prisma.user.findUnique({
      where: { email }
    });
    console.log("Found user:", user);
    return user;
  },

  async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id }
    });
  },

  async verifyPassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }
};

// Team işlemleri
export const teamDb = {
  async create(teamData: { name: string; teamNumber: string; description?: string }) {
    // Team number kontrolü
    const existingTeam = await prisma.team.findFirst({
      where: { teamNumber: teamData.teamNumber }
    });
    
    if (existingTeam) {
      throw new Error('Bu takım numarası zaten kullanılıyor.');
    }

    return await prisma.team.create({
      data: {
        name: teamData.name,
        teamNumber: teamData.teamNumber,
        description: teamData.description || '',
      }
    });
  },

  async findByTeamNumber(teamNumber: string) {
    return await prisma.team.findFirst({
      where: { teamNumber }
    });
  },

  async findById(id: string) {
    return await prisma.team.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: true
          }
        },
        chats: {
          include: {
            user: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });
  },

  async getAll() {
    return await prisma.team.findMany({
      include: {
        members: true,
        chats: true
      }
    });
  }
};

// Team Member işlemleri
export const teamMemberDb = {
  async create(memberData: { userId: string; teamId: string; role?: string }) {
    // Duplicate kontrolü
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        userId: memberData.userId,
        teamId: memberData.teamId
      }
    });
    
    if (existingMember) {
      throw new Error('Kullanıcı zaten bu takımda.');
    }

    return await prisma.teamMember.create({
      data: {
        userId: memberData.userId,
        teamId: memberData.teamId,
        role: memberData.role || 'member',
      }
    });
  },

  async findByUserId(userId: string) {
    return await prisma.teamMember.findMany({
      where: { userId },
      include: {
        team: true
      }
    });
  },

  async findByTeamId(teamId: string) {
    return await prisma.teamMember.findMany({
      where: { teamId },
      include: {
        user: true
      }
    });
  }
};

// Conversation işlemleri
export const conversationDb = {
  async create(conversationData: { userId: string; title?: string; context?: string }) {
    return await prisma.conversation.create({
      data: {
        userId: conversationData.userId,
        title: conversationData.title || 'Yeni Konuşma',
        context: conversationData.context || 'general',
      }
    });
  },

  async findById(id: string) {
    return await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });
  },

  async findByUserId(userId: string) {
    return await prisma.conversation.findMany({
      where: { userId },
      include: {
        messages: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
  },

  async addMessage(conversationId: string, messageData: { role: string; content: string }) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });
    
    if (!conversation) {
      throw new Error('Konuşma bulunamadı.');
    }

    const message = await prisma.message.create({
      data: {
        conversationId: conversationId,
        role: messageData.role,
        content: messageData.content,
      }
    });

    // Conversation'ı güncelle
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    return message;
  },

  async delete(conversationId: string, userId: string) {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: userId
      }
    });
    
    if (!conversation) {
      throw new Error('Konuşma bulunamadı veya silme yetkiniz yok.');
    }

    await prisma.conversation.delete({
      where: { id: conversationId }
    });
    
    return true;
  }
};

// Team Chat işlemleri
export const teamChatDb = {
  async create(chatData: { userId: string; teamId: string; content: string }) {
    return await prisma.teamChat.create({
      data: {
        userId: chatData.userId,
        teamId: chatData.teamId,
        content: chatData.content,
      },
      include: {
        user: true
      }
    });
  },

  async findByTeamId(teamId: string) {
    return await prisma.teamChat.findMany({
      where: { teamId },
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  },

  async delete(chatId: string, userId: string) {
    // Mesajın kullanıcıya ait olduğunu kontrol et
    const chat = await prisma.teamChat.findFirst({
      where: {
        id: chatId,
        userId: userId
      }
    });

    if (!chat) {
      throw new Error('Mesaj bulunamadı veya silme yetkiniz yok.');
    }

    await prisma.teamChat.delete({
      where: { id: chatId }
    });

    return true;
  },

  async clearAll(teamId: string, userId: string) {
    // Kullanıcının takımda olup olmadığını kontrol et
    const member = await prisma.teamMember.findFirst({
      where: {
        teamId: teamId,
        userId: userId
      }
    });

    if (!member) {
      throw new Error('Bu takımın üyesi değilsiniz.');
    }

    // Takımdaki tüm mesajları sil
    await prisma.teamChat.deleteMany({
      where: { teamId: teamId }
    });

    return true;
  }
};