"use client";

import { useState } from "react";
import TierBadge from "@/components/TierBadge";

export default function ChatScreen({ params }: { params: { id: string } }) {
  const { id } = params;

  // Local message state (mock for now)
  const [messages, setMessages] = useState([
    { id: 1, sender: "them", text: "Hey! What do you collect?" },
    { id: 2, sender: "me", text: "Mostly Pokémon and vintage cards." },
  ]);

  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "me", text: input },
    ]);

    setInput("");
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">

      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gray-700" />
        <div>
          <div className="font-semibold text-lg">User {id}</div>
          <div className="text-xs text-gray-400">Collector</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "me" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-xs ${
                msg.sender === "me"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-200"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800 flex items-center gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-4 py-3 rounded-full bg-gray-900 border border-gray-700 focus:outline-none"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-600 rounded-full font-medium"
        >
          Send
        </button>
      </div>
    </div>
  );
}
