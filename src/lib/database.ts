import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export { prisma };

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
    
    // Email verification token oluştur
    const crypto = require('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 saat
    
    return await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        teamNumber: userData.teamNumber,
        role: "member",
        status: "pending",
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
        emailVerified: false
      }
    });
  },
  
  async verifyEmail(token: string) {
    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: token }
    });
    
    if (!user) {
      throw new Error('Geçersiz veya süresi dolmuş doğrulama linki.');
    }
    
    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      throw new Error('Doğrulama linkinin süresi dolmuş.');
    }
    
    if (user.emailVerified) {
      throw new Error('Bu email adresi zaten doğrulanmış.');
    }
    
    // Email'i doğrula ve token'ı temizle
    return await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      }
    });
  },
  
  async regenerateVerificationToken(email: string) {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      throw new Error('Kullanıcı bulunamadı.');
    }
    
    if (user.emailVerified) {
      throw new Error('Email adresi zaten doğrulanmış.');
    }
    
    const crypto = require('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    return await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires
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

  async updateTeamId(userId: string, teamId: string | null) {
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

// Team işlemleri
export const teamDb = {
  async create(teamData: { name: string; teamNumber: string; description?: string; adminId?: string }) {
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
    // Sadece onaylanmış üyelikleri getir
    const allMembers = await prisma.teamMember.findMany({
      where: { userId },
      include: {
        team: true
      }
    });
    
    // Sadece approved olanları döndür
    return allMembers.filter(m => !m.status || m.status === 'approved');
  },

  async findByTeamId(teamId: string) {
    // Önce eski kayıtların status'unu güncelle (NULL olanları 'approved' yap)
    await prisma.$executeRaw`
      UPDATE team_members 
      SET status = 'approved' 
      WHERE team_id = ${teamId} AND (status IS NULL OR status = '')
    `.catch(() => {
      // Hata olursa devam et
    });

    // Tüm üyeleri getir (status kontrolü yapmayalım, hepsini alalım)
    // Sonra filtreleme yapacağız
    const allMembers = await prisma.teamMember.findMany({
      where: { teamId },
      include: {
        user: true
      },
      orderBy: {
        joinedAt: 'desc'
      }
    });

    // Sadece approved olanları veya null olanları döndür
    const approvedMembers = allMembers.filter(m => !m.status || m.status === 'approved');

    // Debug için
    console.log(`[findByTeamId] Team ${teamId} için ${allMembers.length} toplam üye, ${approvedMembers.length} approved üye bulundu`);
    approvedMembers.forEach(m => {
      console.log(`[findByTeamId] Member: ${m.id}, userId: ${m.userId}, status: ${m.status}, user: ${m.user ? m.user.name : 'NULL'}`);
    });

    return approvedMembers;
  },

  async removeMember(userId: string, teamId: string) {
    // Önce TeamMember kaydını bul
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        userId,
        teamId
      }
    });

    if (!teamMember) {
      throw new Error('Kullanıcı bu takımda değil.');
    }

    // Transaction içinde hem TeamMember'ı sil hem de User.teamId'yi null yap
    return await prisma.$transaction(async (tx) => {
      // TeamMember kaydını sil
      await tx.teamMember.delete({
        where: {
          id: teamMember.id
        }
      });

      // User'ın teamId'sini null yap
      await tx.user.update({
        where: { id: userId },
        data: { teamId: null }
      });

      return true;
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

// Takım katılım istekleri
export const teamJoinRequestDb = {
  async create(userId: string, teamId: string, message?: string) {
    // Zaten takımda mı kontrol et
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        userId: userId,
        teamId: teamId
      }
    });

    if (existingMember) {
      throw new Error('Zaten bu takımın üyesisiniz.');
    }

    // Zaten bekleyen istek var mı kontrol et
    const existingRequest = await prisma.teamJoinRequest.findFirst({
      where: {
        userId: userId,
        teamId: teamId,
        status: 'pending'
      }
    });

    if (existingRequest) {
      throw new Error('Zaten bekleyen bir katılım isteğiniz var.');
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
      throw new Error('İstek bulunamadı.');
    }

    // Takımın var olduğundan emin ol - double check
    if (!request.teamId) {
      throw new Error('İstekte takım ID bulunamadı.');
    }

    const team = await prisma.team.findUnique({
      where: { id: request.teamId }
    });

    if (!team) {
      throw new Error(`Takım bulunamadı. Team ID: ${request.teamId}`);
    }

    // Admin kontrolü: Takım yöneticisi ya da yetkili üye olmalı
    const isTeamAdmin = team.adminId === adminUserId;
    const adminMember = await prisma.teamMember.findFirst({
      where: {
        teamId: request.teamId,
        userId: adminUserId,
        role: { in: ['captain', 'manager', 'mentor'] }
      }
    });

    if (!isTeamAdmin && !adminMember) {
      throw new Error('Bu işlem için yetkiniz yok.');
    }

    // Tüm işlemleri transaction içinde yap (atomicity için)
    const result = await prisma.$transaction(async (tx) => {
      // İsteği onayla
      await tx.teamJoinRequest.update({
        where: { id: requestId },
        data: { status: 'approved' }
      });

      // Zaten takımda mı kontrol et
      let existingMember = await tx.teamMember.findFirst({
        where: {
          userId: request.userId,
          teamId: request.teamId
        }
      });

      if (existingMember) {
        // Zaten varsa sadece durumu güncelle
        console.log(`[approve] Existing member found, updating status to approved. Member ID: ${existingMember.id}`);
        existingMember = await tx.teamMember.update({
          where: { id: existingMember.id },
          data: { status: 'approved' }
        });
      } else {
        // Kullanıcıyı takıma ekle
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

      // Kullanıcı durumunu ve teamId'yi güncelle
      console.log(`[approve] Updating user ${request.userId} - setting teamId to ${request.teamId}`);
      await tx.user.update({
        where: { id: request.userId },
        data: {
          status: 'approved',
          teamId: request.teamId
        }
      });

      // Doğrulama: Oluşturulan/güncellenen kayıtları kontrol et
      const verifyMember = await tx.teamMember.findUnique({
        where: { id: existingMember.id },
        include: { user: true }
      });

      const verifyUser = await tx.user.findUnique({
        where: { id: request.userId }
      });

      console.log(`[approve] ✅ BAŞARILI - TeamMember: ${verifyMember ? 'EXISTS' : 'MISSING'}, status: ${verifyMember?.status}`);
      console.log(`[approve] ✅ BAŞARILI - User: ${verifyUser ? 'EXISTS' : 'MISSING'}, teamId: ${verifyUser?.teamId}, status: ${verifyUser?.status}`);
      console.log(`[approve] ✅ User ${verifyUser?.name || verifyUser?.email} takıma eklendi!`);

      return { member: existingMember, user: verifyUser };
    });

    console.log(`[approve] 🎉 Transaction tamamlandı - İstek ${requestId} onaylandı`);
    return true;
  },

  async reject(requestId: string, adminUserId: string) {
    const request = await prisma.teamJoinRequest.findUnique({
      where: { id: requestId },
      include: { team: true }
    });

    if (!request) {
      throw new Error('İstek bulunamadı.');
    }

    // Takımın var olduğundan emin ol
    const team = await prisma.team.findUnique({
      where: { id: request.teamId }
    });

    if (!team) {
      throw new Error(`Takım bulunamadı. Team ID: ${request.teamId}`);
    }

    // Admin kontrolü: Takım yöneticisi ya da yetkili üye olmalı
    const isTeamAdmin = team.adminId === adminUserId;
    const adminMember = await prisma.teamMember.findFirst({
      where: {
        teamId: request.teamId,
        userId: adminUserId,
        role: { in: ['captain', 'manager', 'mentor'] }
      }
    });

    if (!isTeamAdmin && !adminMember) {
      throw new Error('Bu işlem için yetkiniz yok.');
    }

    // İsteği reddet
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
      throw new Error('Bu isteği silme yetkiniz yok.');
    }

    await prisma.teamJoinRequest.delete({
      where: { id: requestId }
    });

    return true;
  }
};

// Takım bildirimleri
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