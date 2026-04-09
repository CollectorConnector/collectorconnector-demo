"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setCurrentUserId(user.id);
      loadConversations(user.id);
    };
    getSession();
  }, []);

  async function loadConversations(userId: string) {
    try {
      // 1. Fetch messages where the user is either sender or receiver
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, username, avatar_url, display_url),
          receiver:profiles!messages_receiver_id_fkey(id, username, avatar_url, display_url)
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const chatPartners = new Map();
      
      data?.forEach((msg) => {
        // Determine who the "other person" is
        const isSender = msg.sender_id === userId;
        const partner = isSender ? msg.receiver : msg.sender;
        
        // Safety check: if profile data is missing, we still want to show the ID
        const partnerId = isSender ? msg.receiver_id : msg.sender_id;

        if (!chatPartners.has(partnerId)) {
          chatPartners.set(partnerId, {
            partnerId,
            partnerName: partner?.display_url || partner?.username || "Unknown Collector",
            partnerAvatar: partner?.avatar_url || "/default-avatar.png",
            lastMessage: msg.content,
            time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
        }
      });

      setConversations(Array.from(chatPartners.values()));
    } catch (err) {
      console.error("Inbox Error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main style={{ marginTop: '80px', padding: '20px', maxWidth: '600px', margin: '80px auto 0' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '24px', letterSpacing: '-1.2px' }}>MESSAGES</h1>

        {loading ? (
          <p style={{ color: '#666' }}>Loading conversations...</p>
        ) : conversations.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <p style={{ color: '#666', marginBottom: '20px' }}>No messages yet.</p>
            <button 
              onClick={() => router.push('/search')}
              style={{ background: '#fff', color: '#000', padding: '12px 24px', borderRadius: '12px', fontWeight: '900', fontSize: '13px' }}
            >
              FIND COLLECTORS
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {conversations.map((conv) => (
              <div 
                key={conv.partnerId}
                onClick={() => router.push(`/profile/${conv.partnerId}?openChat=true`)}
                style={{ 
                  background: '#09090b', 
                  border: '1px solid #27272a', 
                  padding: '16px', 
                  borderRadius: '20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px',
                  cursor: 'pointer',
                  transition: 'transform 0.1s'
                }}
              >
                <img 
                  src={conv.partnerAvatar} 
                  style={{ width: '52px', height: '52px', borderRadius: '14px', objectFit: 'cover', border: '1px solid #27272a' }} 
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '800', fontSize: '15px' }}>{conv.partnerName}</span>
                    <span style={{ fontSize: '11px', color: '#666', fontWeight: 'bold' }}>{conv.time}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#a1a1aa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
                    {conv.lastMessage}
                  </p>
                </div>
                <div style={{ color: '#333' }}>›</div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
