"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CreateProfile() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [youtube, setYoutube] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [tier, setTier] = useState("bronze");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: any) {
    e.preventDefault();

    const { error } = await supabase
      .from("profiles")
      .insert([{
        username,
        bio,
        instagram,
        twitter,
        youtube,
        avatar_url: avatarUrl,
        tier,
      }]);

    if (error) {
      setMessage("❌ Error saving profile: " + error.message);
    } else {
      setMessage("✅ Profile created successfully!");
      setUsername("");
      setBio("");
      setInstagram("");
      setTwitter("");
      setYoutube("");
      setAvatarUrl("");
      setTier("bronze");
    }
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>Create Your Collector Profile</h1>

      <form onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>
        <label>Username</label>
        <input
          style={{ width: "100%" }}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <br /><br />
        <label>Bio</label>
        <textarea
          style={{ width: "100%" }}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
        />

        <br /><br />
        <label>Avatar URL</label>
        <input
          style={{ width: "100%" }}
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
        />

        <br /><br />
        <label>Tier</label>
        <select
          style={{ width: "100%", height: "38px" }}
          value={tier}
          onChange={(e) => setTier(e.target.value)}
        >
          <option value="bronze">Bronze 🟤</option>
          <option value="silver">Silver ⚪</option>
          <option value="gold">Gold 🟡</option>
          <option value="platinum">Platinum 🟦</option>
        </select>

        <br /><br />
        <label>Instagram</label>
        <input
          style={{ width: "100%" }}
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
        />

        <br /><br />
        <label>Twitter</label>
        <input
          style={{ width: "100%" }}
          value={twitter}
          onChange={(e) => setTwitter(e.target.value)}
        />

        <br /><br />
        <label>YouTube</label>
        <input
          style={{ width: "100%" }}
          value={youtube}
          onChange={(e) => setYoutube(e.target.value)}
        />

        <br /><br />
        <button
          type="submit"
          style={{
            background: "#4ADE80",
            padding: "12px 20px",
            border: "none",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          Save Profile
        </button>
      </form>

      {message && (
        <p style={{ marginTop: "20px", fontWeight: "bold" }}>{message}</p>
      )}
    </div>
  );
}
