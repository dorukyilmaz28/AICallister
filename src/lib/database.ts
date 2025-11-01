﻿import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export { prisma };

// User iÅŸlemleri
export const userDb = {
  async create(userData: { name: string; email: string; password: string; teamNumber: string }) {
    // Email kontrolÃ¼
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });
    
    if (existingUser) {
      throw new Error('Bu email adresi zaten kullanÄ±lÄ±yor.');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    return await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        teamNumber: userData.teamNumber,
        role: "member",
        status: "pending"
      }
    });
  },

  async updateStatus(userId: string, status: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { status }
    });
  },

  async updateRole(userId: string, role: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { role }
    });
  },

  async updateTeamId(userId: string, teamId: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { teamId }
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

// Team iÅŸlemleri
export const teamDb = {
  async create(teamData: { name: string; teamNumber: string; description?: string; adminId?: string }) {
    // Team number kontrolÃ¼
    const existingTeam = await prisma.team.findFirst({
      where: { teamNumber: teamData.teamNumber }
    });
    
    if (existingTeam) {
      throw new Error('Bu takÄ±m numarasÄ± zaten kullanÄ±lÄ±yor.');
    }

    return await prisma.team.create({
      data: {
        name: teamData.name,
        teamNumber: teamData.teamNumber,
        description: teamData.description || '',
        adminId: teamData.adminId,
      }
    });
  },

  async updateAdmin(teamId: string, adminId: string) {
    return await prisma.team.update({
      where: { id: teamId },
      data: { adminId }
    });
  },

  async getTeamMembers(teamId: string) {
    return await prisma.user.findMany({
      where: { teamId },
      include: {
        teamMemberships: {
          where: { teamId }
        }
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

// Team Member iÅŸlemleri
export const teamMemberDb = {
  async create(memberData: { userId: string; teamId: string; role?: string }) {
    // Duplicate kontrolÃ¼
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        userId: memberData.userId,
        teamId: memberData.teamId
      }
    });
    
    if (existingMember) {
      throw new Error('KullanÄ±cÄ± zaten bu takÄ±mda.');
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
    // Sadece onaylanmÄ±ÅŸ Ã¼yelikleri getir
    const allMembers = await prisma.teamMember.findMany({
      where: { userId },
      include: {
        team: true
      }
    });
    
    // Sadece approved olanlarÄ± dÃ¶ndÃ¼r
    return allMembers.filter(m => !m.status || m.status === 'approved');
  },

  async findByTeamId(teamId: string) {
    // Ã–nce eski kayÄ±tlarÄ±n status'unu gÃ¼ncelle (NULL olanlarÄ± 'approved' yap)
    await prisma.$executeRaw`
      UPDATE team_members 
      SET status = 'approved' 
      WHERE team_id = ${teamId} AND (status IS NULL OR status = '')
    `.catch(() => {
      // Hata olursa devam et
    });

    // TÃ¼m Ã¼yeleri getir (status kontrolÃ¼ yapmayalÄ±m, hepsini alalÄ±m)
    // Sonra filtreleme yapacaÄŸÄ±z
    const allMembers = await prisma.teamMember.findMany({
      where: { teamId },
      include: {
        user: true
      },
      orderBy: {
        joinedAt: 'desc'
      }
    });

    // Sadece approved olanlarÄ± veya null olanlarÄ± dÃ¶ndÃ¼r
    const approvedMembers = allMembers.filter(m => !m.status || m.status === 'approved');

    // Debug iÃ§in
    console.log(`[findByTeamId] Team ${teamId} iÃ§in ${allMembers.length} toplam Ã¼ye, ${approvedMembers.length} approved Ã¼ye bulundu`);
    approvedMembers.forEach(m => {
      console.log(`[findByTeamId] Member: ${m.id}, userId: ${m.userId}, status: ${m.status}, user: ${m.user ? m.user.name : 'NULL'}`);
    });

    return approvedMembers;
  }
};

// Conversation iÅŸlemleri
export const conversationDb = {
  async create(conversationData: { userId: string; title?: string; context?: string }) {
    return await prisma.conversation.create({
      data: {
        userId: conversationData.userId,
        title: conversationData.title || 'Yeni KonuÅŸma',
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
      throw new Error('KonuÅŸma bulunamadÄ±.');
    }

    const message = await prisma.message.create({
      data: {
        conversationId: conversationId,
        role: messageData.role,
        content: messageData.content,
      }
    });

    // Conversation'Ä± gÃ¼ncelle
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
      throw new Error('KonuÅŸma bulunamadÄ± veya silme yetkiniz yok.');
    }

    await prisma.conversation.delete({
      where: { id: conversationId }
    });
    
    return true;
  }
};

// Team Chat iÅŸlemleri
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
    // MesajÄ±n kullanÄ±cÄ±ya ait olduÄŸunu kontrol et
    const chat = await prisma.teamChat.findFirst({
      where: {
        id: chatId,
        userId: userId
      }
    });

    if (!chat) {
      throw new Error('Mesaj bulunamadÄ± veya silme yetkiniz yok.');
    }

    await prisma.teamChat.delete({
      where: { id: chatId }
    });

    return true;
  },

  async clearAll(teamId: string, userId: string) {
    // KullanÄ±cÄ±nÄ±n takÄ±mda olup olmadÄ±ÄŸÄ±nÄ± kontrol et
    const member = await prisma.teamMember.findFirst({
      where: {
        teamId: teamId,
        userId: userId
      }
    });

    if (!member) {
      throw new Error('Bu takÄ±mÄ±n Ã¼yesi deÄŸilsiniz.');
    }

    // TakÄ±mdaki tÃ¼m mesajlarÄ± sil
    await prisma.teamChat.deleteMany({
      where: { teamId: teamId }
    });

    return true;
  }
};

// TakÄ±m katÄ±lÄ±m istekleri
export const teamJoinRequestDb = {
  async create(userId: string, teamId: string, message?: string) {
    // Zaten takÄ±mda mÄ± kontrol et
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        userId: userId,
        teamId: teamId
      }
    });

    if (existingMember) {
      throw new Error('Zaten bu takÄ±mÄ±n Ã¼yesisiniz.');
    }

    // Zaten bekleyen istek var mÄ± kontrol et
    const existingRequest = await prisma.teamJoinRequest.findFirst({
      where: {
        userId: userId,
        teamId: teamId,
        status: 'pending'
      }
    });

    if (existingRequest) {
      throw new Error('Zaten bekleyen bir katÄ±lÄ±m isteÄŸiniz var.');
    }

    return await prisma.teamJoinRequest.create({
      data: {
        userId: userId,
        teamId: teamId,
        message: message
      }
    });
  },

  async findByTeamId(teamId: string) {
    return await prisma.teamJoinRequest.findMany({
      where: { teamId: teamId },
      include: {
        user: true,
        team: true
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async approve(requestId: string, adminUserId: string) {
    const request = await prisma.teamJoinRequest.findUnique({
      where: { id: requestId },
      include: { team: true }
    });

    if (!request) {
      throw new Error('Ä°stek bulunamadÄ±.');
    }

    // TakÄ±mÄ±n var olduÄŸundan emin ol - double check
    if (!request.teamId) {
      throw new Error('Ä°stekte takÄ±m ID bulunamadÄ±.');
    }

    const team = await prisma.team.findUnique({
      where: { id: request.teamId }
    });

    if (!team) {
      throw new Error(`TakÄ±m bulunamadÄ±. Team ID: ${request.teamId}`);
    }

    // Admin kontrolÃ¼: TakÄ±m yÃ¶neticisi ya da yetkili Ã¼ye olmalÄ±
    const isTeamAdmin = team.adminId === adminUserId;
    const adminMember = await prisma.teamMember.findFirst({
      where: {
        teamId: request.teamId,
        userId: adminUserId,
        role: { in: ['captain', 'manager', 'mentor'] }
      }
    });

    if (!isTeamAdmin && !adminMember) {
      throw new Error('Bu iÅŸlem iÃ§in yetkiniz yok.');
    }

    // TÃ¼m iÅŸlemleri transaction iÃ§inde yap (atomicity iÃ§in)
    const result = await prisma.$transaction(async (tx) => {
      // Ä°steÄŸi onayla
      await tx.teamJoinRequest.update({
        where: { id: requestId },
        data: { status: 'approved' }
      });

      // Zaten takÄ±mda mÄ± kontrol et
      let existingMember = await tx.teamMember.findFirst({
        where: {
          userId: request.userId,
          teamId: request.teamId
        }
      });

      if (existingMember) {
        // Zaten varsa sadece durumu gÃ¼ncelle
        console.log(`[approve] Existing member found, updating status to approved. Member ID: ${existingMember.id}`);
        existingMember = await tx.teamMember.update({
          where: { id: existingMember.id },
          data: { status: 'approved' }
        });
      } else {
        // KullanÄ±cÄ±yÄ± takÄ±ma ekle
        console.log(`[approve] Creating new team member. UserId: ${request.userId}, TeamId: ${request.teamId}`);
        existingMember = await tx.teamMember.create({
          data: {
            userId: request.userId,
            teamId: request.teamId,
            role: 'member',
            status: 'approved'
          }
        });
        console.log(`[approve] Team member created successfully. Member ID: ${existingMember.id}`);
      }

      // KullanÄ±cÄ± durumunu ve teamId'yi gÃ¼ncelle
      await tx.user.update({
        where: { id: request.userId },
        data: {
          status: 'approved',
          teamId: request.teamId
        }
      });

      // DoÄŸrulama: OluÅŸturulan/gÃ¼ncellenen kayÄ±tlarÄ± kontrol et
      const verifyMember = await tx.teamMember.findUnique({
        where: { id: existingMember.id },
        include: { user: true }
      });

      const verifyUser = await tx.user.findUnique({
        where: { id: request.userId }
      });

      console.log(`[approve] Verification - TeamMember: ${verifyMember ? 'EXISTS' : 'MISSING'}, status: ${verifyMember?.status}`);
      console.log(`[approve] Verification - User: ${verifyUser ? 'EXISTS' : 'MISSING'}, teamId: ${verifyUser?.teamId}, status: ${verifyUser?.status}`);

      return { member: existingMember, user: verifyUser };
    });

    return true;
  },

  async reject(requestId: string, adminUserId: string) {
    const request = await prisma.teamJoinRequest.findUnique({
      where: { id: requestId },
      include: { team: true }
    });

    if (!request) {
      throw new Error('Ä°stek bulunamadÄ±.');
    }

    // TakÄ±mÄ±n var olduÄŸundan emin ol
    const team = await prisma.team.findUnique({
      where: { id: request.teamId }
    });

    if (!team) {
      throw new Error(`TakÄ±m bulunamadÄ±. Team ID: ${request.teamId}`);
    }

    // Admin kontrolÃ¼: TakÄ±m yÃ¶neticisi ya da yetkili Ã¼ye olmalÄ±
    const isTeamAdmin = team.adminId === adminUserId;
    const adminMember = await prisma.teamMember.findFirst({
      where: {
        teamId: request.teamId,
        userId: adminUserId,
        role: { in: ['captain', 'manager', 'mentor'] }
      }
    });

    if (!isTeamAdmin && !adminMember) {
      throw new Error('Bu iÅŸlem iÃ§in yetkiniz yok.');
    }

    // Ä°steÄŸi reddet
    await prisma.teamJoinRequest.update({
      where: { id: requestId },
      data: { status: 'rejected' }
    });

    return true;
  },

  async delete(requestId: string, userId: string) {
    const request = await prisma.teamJoinRequest.findUnique({
      where: { id: requestId }
    });

    if (!request || request.userId !== userId) {
      throw new Error('Bu isteÄŸi silme yetkiniz yok.');
    }

    await prisma.teamJoinRequest.delete({
      where: { id: requestId }
    });

    return true;
  }
};

// TakÄ±m bildirimleri
export const teamNotificationDb = {
  async create(teamId: string, type: string, title: string, message: string, userId?: string) {
    return await prisma.teamNotification.create({
      data: {
        teamId: teamId,
        type: type,
        title: title,
        message: message,
        userId: userId
      }
    });
  },

  async findByTeamId(teamId: string) {
    return await prisma.teamNotification.findMany({
      where: { teamId: teamId },
      include: {
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async markAsRead(notificationId: string) {
    return await prisma.teamNotification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });
  },

  async markAllAsRead(teamId: string) {
    return await prisma.teamNotification.updateMany({
      where: { 
        teamId: teamId,
        isRead: false 
      },
      data: { isRead: true }
    });
  },

  async getUnreadCount(teamId: string) {
    return await prisma.teamNotification.count({
      where: { 
        teamId: teamId,
        isRead: false 
      }
    });
  },

  async delete(notificationId: string) {
    return await prisma.teamNotification.delete({
      where: { id: notificationId }
    });
  }
};