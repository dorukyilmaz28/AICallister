"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Users, CheckCircle, XCircle, Clock, User, Mail, MessageSquare } from "lucide-react";

interface JoinRequest {
  id: string;
  status: string;
  message?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const teamId = params.id as string;
  
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (teamId) {
      fetchRequests();
    }
  }, [status, teamId]);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`/api/teams/${teamId}/join-requests`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "İstekler getirilemedi.");
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      setError("İstekler getirilirken hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/teams/${teamId}/join-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        // İstekleri yeniden yükle
        await fetchRequests();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "İşlem başarısız.");
      }
    } catch (error) {
      console.error("Error processing request:", error);
      setError("İşlem sırasında hata oluştu.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Bekliyor';
      case 'approved':
        return 'Onaylandı';
      case 'rejected':
        return 'Reddedildi';
      default:
        return 'Bilinmiyor';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}>
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #3A006F 0%, #5A008F 50%, #8A00FF 100%)' }}>
      {/* Header */}
      <div className="border-b border-white/20 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href={`/teams/${teamId}`}
              className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Takıma Dön</span>
            </Link>
            <div className="h-6 w-px bg-white/30"></div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-white" />
              <h1 className="text-xl font-bold text-white">Admin Paneli</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-3">
                <Clock className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-white/60 text-sm">Bekleyen İstekler</p>
                  <p className="text-white text-2xl font-bold">
                    {requests.filter(r => r.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-white/60 text-sm">Onaylanan</p>
                  <p className="text-white text-2xl font-bold">
                    {requests.filter(r => r.status === 'approved').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-3">
                <XCircle className="w-8 h-8 text-red-400" />
                <div>
                  <p className="text-white/60 text-sm">Reddedilen</p>
                  <p className="text-white text-2xl font-bold">
                    {requests.filter(r => r.status === 'rejected').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Requests List */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <div className="p-6 border-b border-white/20">
              <h2 className="text-lg font-bold text-white">Katılım İstekleri</h2>
            </div>
            
            <div className="p-6">
              {requests.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/70 text-lg">Henüz katılım isteği yok</p>
                  <p className="text-white/50 text-sm">Takım üyeleri katılım isteği gönderdiğinde burada görünecek</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-white/10 rounded-xl p-4 border border-white/20"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-white font-medium">{request.user.name}</h3>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(request.status)}
                                <span className="text-white/60 text-sm">
                                  {getStatusText(request.status)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-1 text-white/60 text-sm mb-2">
                              <Mail className="w-3 h-3" />
                              <span>{request.user.email}</span>
                            </div>
                            
                            {request.message && (
                              <div className="flex items-start space-x-1 text-white/70 text-sm">
                                <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                <span>{request.message}</span>
                              </div>
                            )}
                            
                            <div className="text-white/50 text-xs mt-2">
                              {formatDate(request.createdAt)}
                            </div>
                          </div>
                        </div>
                        
                        {request.status === 'pending' && (
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleRequestAction(request.id, 'approve')}
                              className="flex items-center space-x-1 px-3 py-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-300 hover:text-green-200 transition-colors duration-200 text-sm"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Onayla</span>
                            </button>
                            
                            <button
                              onClick={() => handleRequestAction(request.id, 'reject')}
                              className="flex items-center space-x-1 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 hover:text-red-200 transition-colors duration-200 text-sm"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Reddet</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
