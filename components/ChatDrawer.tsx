"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function ChatDrawer({ isOpen, onClose, receiverId, receiverName }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    // 1. Get current user
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id);
    });

    if (isOpen && receiverId) {
      // 2. Fetch existing messages
      fetchMessages();

      // 3. Subscribe to REALTIME changes
      const channel = supabase
        .channel('realtime:messages')
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages' 
        }, (payload) => {
          if (
            (payload.new.sender_id === receiverId && payload.new.receiver_id === currentUserId) ||
            (payload.new.sender_id === currentUserId && payload.new.receiver_id === receiverId)
          ) {
            setMessages((prev) => [...prev, payload.new]);
          }
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [isOpen, receiverId, currentUserId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchMessages() {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${currentUserId})`)
      .order("created_at", { ascending: true });
    if (data) setMessages(data);
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { error } = await supabase.from("messages").insert([
      {
        sender_id: currentUserId,
        receiver_id: receiverId,
        content: newMessage,
      },
    ]);

    if (!error) setNewMessage("");
  }

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      right: 0,
      width: "380px",
      height: "100vh",
      background: "#0a0a0a",
      borderLeft: "1px solid #1f1f1f",
      zIndex: 100,
      display: "flex",
      flexDirection: "column",
      boxShadow: "-10px 0 30px rgba(0,0,0,0.5)"
    }}>
      {/* HEADER */}
      <div style={{ padding: "20px", borderBottom: "1px solid #1f1f1f", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>Chat with {receiverName}</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "20px" }}>×</button>
      </div>

      {/* MESSAGES AREA */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{
            alignSelf: msg.sender_id === currentUserId ? "flex-end" : "flex-start",
            background: msg.sender_id === currentUserId ? "#fff" : "#1f1f1f",
            color: msg.sender_id === currentUserId ? "#000" : "#fff",
            padding: "10px 14px",
            borderRadius: "12px",
            maxWidth: "80%",
            fontSize: "14px"
          }}>
            {msg.content}
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* INPUT AREA */}
      <form onSubmit={sendMessage} style={{ padding: "20px", borderTop: "1px solid #1f1f1f" }}>
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={{
            width: "100%",
            padding: "12px",
            background: "#121212",
            border: "1px solid #333",
            borderRadius: "8px",
            color: "#fff",
            outline: "none"
          }}
        />
      </form>
    </div>
  );
}
