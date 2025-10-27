import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// Database dosya yolları
const DB_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DB_DIR, 'users.json');
const TEAMS_FILE = path.join(DB_DIR, 'teams.json');
const TEAM_MEMBERS_FILE = path.join(DB_DIR, 'team-members.json');
const CONVERSATIONS_FILE = path.join(DB_DIR, 'conversations.json');
const TEAM_CHATS_FILE = path.join(DB_DIR, 'team-chats.json');

// Database dizinini oluştur
function ensureDbDir() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

// Dosyayı oku
function readFile(filePath: string, defaultValue: any[] = []) {
  try {
    ensureDbDir();
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return defaultValue;
  }
}

// Dosyaya yaz
function writeFile(filePath: string, data: any[]) {
  try {
    ensureDbDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
}

// ID oluştur
function generateId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// User işlemleri
export const userDb = {
  async create(userData: { name: string; email: string; password: string; teamNumber: string }) {
    const users = readFile(USERS_FILE);
    
    // Email kontrolü
    if (users.find((u: any) => u.email === userData.email)) {
      throw new Error('Bu email adresi zaten kullanılıyor.');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const newUser = {
      id: generateId(),
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      teamNumber: userData.teamNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(newUser);
    writeFile(USERS_FILE, users);
    return newUser;
  },

  async findByEmail(email: string) {
    const users = readFile(USERS_FILE);
    return users.find((u: any) => u.email === email);
  },

  async findById(id: string) {
    const users = readFile(USERS_FILE);
    return users.find((u: any) => u.id === id);
  },

  async verifyPassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }
};

// Team işlemleri
export const teamDb = {
  async create(teamData: { name: string; teamNumber: string; description?: string }) {
    const teams = readFile(TEAMS_FILE);
    
    // Team number kontrolü
    if (teams.find((t: any) => t.teamNumber === teamData.teamNumber)) {
      throw new Error('Bu takım numarası zaten kullanılıyor.');
    }

    const newTeam = {
      id: generateId(),
      name: teamData.name,
      teamNumber: teamData.teamNumber,
      description: teamData.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    teams.push(newTeam);
    writeFile(TEAMS_FILE, teams);
    return newTeam;
  },

  async findByTeamNumber(teamNumber: string) {
    const teams = readFile(TEAMS_FILE);
    return teams.find((t: any) => t.teamNumber === teamNumber);
  },

  async findById(id: string) {
    const teams = readFile(TEAMS_FILE);
    return teams.find((t: any) => t.id === id);
  },

  async getAll() {
    return readFile(TEAMS_FILE);
  }
};

// Team Member işlemleri
export const teamMemberDb = {
  async create(memberData: { userId: string; teamId: string; role?: string }) {
    const members = readFile(TEAM_MEMBERS_FILE);
    
    // Duplicate kontrolü
    if (members.find((m: any) => m.userId === memberData.userId && m.teamId === memberData.teamId)) {
      throw new Error('Kullanıcı zaten bu takımda.');
    }

    const newMember = {
      id: generateId(),
      userId: memberData.userId,
      teamId: memberData.teamId,
      role: memberData.role || 'member',
      joinedAt: new Date().toISOString()
    };

    members.push(newMember);
    writeFile(TEAM_MEMBERS_FILE, members);
    return newMember;
  },

  async findByUserId(userId: string) {
    const members = readFile(TEAM_MEMBERS_FILE);
    return members.filter((m: any) => m.userId === userId);
  },

  async findByTeamId(teamId: string) {
    const members = readFile(TEAM_MEMBERS_FILE);
    return members.filter((m: any) => m.teamId === teamId);
  }
};

// Conversation işlemleri
export const conversationDb = {
  async create(conversationData: { userId: string; title?: string; context?: string }) {
    const conversations = readFile(CONVERSATIONS_FILE);
    
    const newConversation = {
      id: generateId(),
      userId: conversationData.userId,
      title: conversationData.title || 'Yeni Konuşma',
      context: conversationData.context || 'general',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    conversations.push(newConversation);
    writeFile(CONVERSATIONS_FILE, conversations);
    return newConversation;
  },

  async findById(id: string) {
    const conversations = readFile(CONVERSATIONS_FILE);
    return conversations.find((c: any) => c.id === id);
  },

  async findByUserId(userId: string) {
    const conversations = readFile(CONVERSATIONS_FILE);
    return conversations.filter((c: any) => c.userId === userId);
  },

  async addMessage(conversationId: string, messageData: { role: string; content: string }) {
    const conversations = readFile(CONVERSATIONS_FILE);
    const conversation = conversations.find((c: any) => c.id === conversationId);
    
    if (!conversation) {
      throw new Error('Konuşma bulunamadı.');
    }

    const newMessage = {
      id: generateId(),
      role: messageData.role,
      content: messageData.content,
      createdAt: new Date().toISOString()
    };

    conversation.messages.push(newMessage);
    conversation.updatedAt = new Date().toISOString();
    
    writeFile(CONVERSATIONS_FILE, conversations);
    return newMessage;
  }
};

// Team Chat işlemleri
export const teamChatDb = {
  async create(chatData: { userId: string; teamId: string; content: string }) {
    const chats = readFile(TEAM_CHATS_FILE);
    
    const newChat = {
      id: generateId(),
      userId: chatData.userId,
      teamId: chatData.teamId,
      content: chatData.content,
      createdAt: new Date().toISOString()
    };

    chats.push(newChat);
    writeFile(TEAM_CHATS_FILE, chats);
    return newChat;
  },

  async findByTeamId(teamId: string) {
    const chats = readFile(TEAM_CHATS_FILE);
    return chats.filter((c: any) => c.teamId === teamId);
  }
};
