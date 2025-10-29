"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Crown, 
  Clock, 
  CheckCircle, 
  XCircle,
  Trash2,
  Shield,
  Home
} from "lucide-react";
import Link from "next/link";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joinedAt?: string;
  requestedAt?: string;
}

interface TeamInfo {
  team: {
    id: string;
    name: string;
    teamNumber: string;
    description: string;
    adminId: string;
  };
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
  };
  approvedMembers: TeamMember[];
  pendingMembers: TeamMember[];
}

export default function TeamAdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (session.user.role !== "admin") {
      router.push("/");
      return;
    }

    fetchTeamInfo();
  }, [session, status, router]);

  const fetchTeamInfo = async () => {
    try {
      const response = await fetch("/api/teams/info");
      const data = await response.json();
      
      if (response.ok) {
        setTeamInfo(data);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("Takım bilgileri alınırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleMemberAction = async (userId: string, action: string) => {
    setActionLoading(`${userId}-${action}`);
    setError("");

    try {
      const response = await fetch("/api/teams/manage-member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, action }),
      });

      const data = await response.json();

      if (response.ok) {
        // Takım bilgilerini yenile
        await fetchTeamInfo();
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("İşlem sırasında bir hata oluştu.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}>
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (!teamInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}>
        <div className="text-white text-xl">Takım bilgileri bulunamadı.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Takım Yönetimi
              </h1>
              <p className="text-white/70">
                {teamInfo.team.name} (#{teamInfo.team.teamNumber})
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white/70">
                <Shield className="w-6 h-6" />
                <span className="text-lg font-medium">Yönetici</span>
              </div>
              <Link
                href="/"
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white/70 hover:text-white transition-colors"
              >
                <Home className="w-5 h-5" />
                <span>Ana Sayfa</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Onay Bekleyen Üyeler */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center mb-6">
              <Clock className="w-6 h-6 text-yellow-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">
                Onay Bekleyen Üyeler
              </h2>
              <span className="ml-3 bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-medium">
                {teamInfo.pendingMembers.length}
              </span>
            </div>

            {teamInfo.pendingMembers.length === 0 ? (
              <div className="text-white/70 text-center py-8">
                Onay bekleyen üye bulunmuyor.
              </div>
            ) : (
              <div className="space-y-4">
                {teamInfo.pendingMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">{member.name}</h3>
                        <p className="text-white/70 text-sm">{member.email}</p>
                        <p className="text-white/50 text-xs">
                          İstek tarihi: {new Date(member.requestedAt || "").toLocaleDateString("tr-TR")}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleMemberAction(member.id, "approve")}
                          disabled={actionLoading === `${member.id}-approve`}
                          className="p-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-300 hover:text-green-200 transition-colors disabled:opacity-50"
                          title="Onayla"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleMemberAction(member.id, "reject")}
                          disabled={actionLoading === `${member.id}-reject`}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 hover:text-red-200 transition-colors disabled:opacity-50"
                          title="Reddet"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Onaylanmış Üyeler */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center mb-6">
              <UserCheck className="w-6 h-6 text-green-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">
                Onaylanmış Üyeler
              </h2>
              <span className="ml-3 bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                {teamInfo.approvedMembers.length}
              </span>
            </div>

            {teamInfo.approvedMembers.length === 0 ? (
              <div className="text-white/70 text-center py-8">
                Onaylanmış üye bulunmuyor.
              </div>
            ) : (
              <div className="space-y-4">
                {teamInfo.approvedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div>
                          <h3 className="text-white font-medium flex items-center">
                            {member.name}
                            {member.role === "admin" && (
                              <Crown className="w-4 h-4 text-yellow-400 ml-2" />
                            )}
                          </h3>
                          <p className="text-white/70 text-sm">{member.email}</p>
                          <p className="text-white/50 text-xs">
                            Katılım: {new Date(member.joinedAt || "").toLocaleDateString("tr-TR")}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {member.role !== "admin" && (
                          <button
                            onClick={() => handleMemberAction(member.id, "make_admin")}
                            disabled={actionLoading === `${member.id}-make_admin`}
                            className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-lg text-yellow-300 hover:text-yellow-200 transition-colors disabled:opacity-50"
                            title="Yönetici Yap"
                          >
                            <Crown className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleMemberAction(member.id, "remove")}
                          disabled={actionLoading === `${member.id}-remove`}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 hover:text-red-200 transition-colors disabled:opacity-50"
                          title="Takımdan Çıkar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* İstatistikler */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Takım İstatistikleri</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {teamInfo.approvedMembers.length}
              </div>
              <div className="text-white/70">Onaylanmış Üye</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {teamInfo.pendingMembers.length}
              </div>
              <div className="text-white/70">Onay Bekleyen</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {teamInfo.approvedMembers.filter(m => m.role === "admin").length}
              </div>
              <div className="text-white/70">Yönetici</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
