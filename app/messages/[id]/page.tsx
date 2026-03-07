"use client";

import { useState } from "react";
import TierBadge from "@/components/TierBadge";

export default function ChatScreen() {
  // Temporary mock data
  const otherUser = {
    name: "Richard House",
    avatar: "/default-avatar.png",
    tier: "FOUNDER",
  };

  const [messages, setMessages] = useState([
    { id: 1, sender: "them", text: "Hey Stacy, how’s the app going?" },
    { id: 2, sender: "me", text: "Really well! Just polishing the UI." },
    { id: 3, sender: "them", text: "It’s looking amazing already." },
  ]);

  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages([
      ...messages,
      { id: Date.now(), sender: "me", text: input },
    ]);

    setInput("");
  };

  return (
    <div className="flex flex-col h-screen bg-white">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 shadow-sm">
        <div className="w-10 h-10 rounded-2xl overflow-hidden">
          <img src={otherUser.avatar} className="w-full h-full object-cover" />
        </div>

        <div className="flex flex-col">
          <span className="font-medium">{otherUser.name}</span>
          <div className="flex items-center gap-1">
            <TierBadge tier={otherUser.tier} size="sm" />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ${
              msg.sender === "me"
                ? "ml-auto bg-black text-white"
                : "mr-auto bg-gray-100 text-gray-900"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 shadow-inner">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message..."
            className="flex-1 bg-transparent outline-none"
          />
          <button
            onClick={sendMessage}
            className="ml-3 px-4 py-1 bg-black text-white rounded-full font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
