"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

// Define the shape of the props for TypeScript
interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  receiverId: string;
  receiverName: string;
}

export default function ChatDrawer({ isOpen, onClose, receiverId, receiverName }: ChatDrawerProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  // NEW: Function to mark messages as read
  const markAsRead = async () => {
    if (!currentUserId || !receiverId) return;
    
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("sender_id", receiverId)
      .eq("receiver_id", currentUserId)
      .eq("is_read", false);
  };

  useEffect(() => {
    if (!isOpen || !currentUserId || !receiverId) return;

    // 1. Initial Load of messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${currentUserId})`)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data);
        // Mark these as read now that we've loaded them
        markAsRead();
      }
    };

    fetchMessages();

    // 2. Real-time Subscription
    const channel = supabase
      .channel("realtime-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new;
          if (
            (msg.sender_id === currentUserId && msg.receiver_id === receiverId) ||
            (msg.sender_id === receiverId && msg.receiver_id === currentUserId)
          ) {
            setMessages((prev) => [...prev, msg]);
            
            // If the chat is open and we receive a message from the other person, mark it read immediately
            if (msg.sender_id === receiverId) {
              markAsRead();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, currentUserId, receiverId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId) return;

    const { error } = await supabase.from("messages").insert({
      sender_id: currentUserId,
      receiver_id: receiverId,
      content: newMessage.trim(),
    });

    if (error) {
      console.error("Error sending message:", error);
    } else {
      setNewMessage("");
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", top: 0, right: 0, width: "100%", maxWidth: "400px", height: "100%", background: "#000", borderLeft: "1px solid #27272a", zIndex: 5000, display: "flex", flexDirection: "column", boxShadow: "-10px 0 30px rgba(0,0,0,0.5)" }}>
      {/* HEADER */}
      <div style={{ padding: "20px", borderBottom: "1px solid #27272a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "900" }}>{receiverName}</h3>
          <p style={{ margin: 0, fontSize: "10px", color: "#4ade80" }}>Online</p>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", fontSize: "24px", cursor: "pointer" }}>✕</button>
      </div>

      {/* MESSAGES AREA */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "80%", background: isMe ? "#fff" : "#27272a", color: isMe ? "#000" : "#fff", padding: "10px 14px", borderRadius: isMe ? "16px 16px 2px 16px" : "16px 16px 16px 2px", fontSize: "14px", fontWeight: "500" }}>
              {msg.content}
            </div>
          );
        })}
      </div>

      {/* INPUT AREA */}
      <form onSubmit={sendMessage} style={{ padding: "20px", borderTop: "1px solid #27272a", background: "#09090b" }}>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write a message..."
            style={{ flex: 1, background: "#18181b", border: "1px solid #27272a", color: "#fff", padding: "12px", borderRadius: "12px", outline: "none" }}
          />
          <button type="submit" style={{ background: "#fff", color: "#000", fontWeight: "900", padding: "0 20px", borderRadius: "12px", border: "none" }}>SEND</button>
        </div>
      </form>
    </div>
  );
}
