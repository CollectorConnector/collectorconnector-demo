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
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/auth/login");
        return;
      }
      setCurrentUserId(data.user.id);
      loadConversations(data.user.id);
    };
    getSession();
  }, []);

  async function loadConversations(userId: string) {
    try {
      // This query gets the latest message for every conversation the user is part of
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:sender_id(id, username, avatar_url, display_url),
          receiver:receiver_id(id, username, avatar_url, display_url)
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Logic to group messages by user so we only show one entry per contact
      const chatPartners = new Map();
      data?.forEach((msg) => {
        const partner = msg.sender_id === userId ? msg.receiver : msg.sender;
        if (!chatPartners.has(partner.id)) {
          chatPartners.set(partner.id, {
            partner,
            lastMessage: msg.content,
            time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
        }
      });

      setConversations(Array.from(chatPartners.values()));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main style={{ marginTop: '80px', padding: '20px', maxWidth: '600px', margin: '80px auto 0' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '24px', letterSpacing: '-1px' }}>MESSAGES</h1>

        {loading ? (
          <p style={{ color: '#666' }}>Loading conversations...</p>
        ) : conversations.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '100px', color: '#666' }}>
            <p>No messages yet.</p>
            <button 
              onClick={() => router.push('/search')}
              style={{ marginTop: '20px', background: '#fff', color: '#000', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold' }}
            >
              FIND COLLECTORS
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {conversations.map((conv) => (
              <div 
                key={conv.partner.id}
                onClick={() => router.push(`/profile/${conv.partner.id}?openChat=true`)}
                style={{ 
                  background: '#09090b', 
                  border: '1px solid #27272a', 
                  padding: '16px', 
                  borderRadius: '16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px',
                  cursor: 'pointer'
                }}
              >
                <img 
                  src={conv.partner.avatar_url || "/default-avatar.png"} 
                  style={{ width: '50px', height: '50px', borderRadius: '12px', objectFit: 'cover' }} 
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 'bold' }}>{conv.partner.display_url || conv.partner.username}</span>
                    <span style={{ fontSize: '12px', color: '#666' }}>{conv.time}</span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#a1a1aa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                    {conv.lastMessage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
