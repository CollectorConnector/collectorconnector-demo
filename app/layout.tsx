
"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  async function handleUpload() {
    if (!file) return alert("Please select an image first.");

    setUploading(true);

    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("images")
      .upload(fileName, file);

    if (error) {
      console.error(error);
      alert("Upload failed.");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("images")
      .getPublicUrl(fileName);

    setImageUrl(urlData.publicUrl);
    setUploading(false);
  }

  return (
    <div
      style={{
        background: "black",
        color: "white",
        minHeight: "100vh",
        padding: "40px",
      }}
    >
      <h1 style={{ fontSize: "28px", marginBottom: "20px", color: "#4ADE80" }}>
        Upload a Picture
      </h1>

      <input
        type="file"
        accept="image/*"
        style={{
          marginBottom: "20px",
          padding: "10px",
          background: "#1f1f1f",
          border: "1px solid #333",
        }}
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button
        onClick={handleUpload}
        disabled={uploading}
        style={{
          background: "#4ADE80",
          color: "black",
          padding: "12px 20px",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
          marginRight: "10px",
          fontWeight: "bold",
        }}
      >
        {uploading ? "Uploading..." : "Upload Image"}
      </button>

      <button
        style={{
          background: "transparent",
          border: "1px solid #4ADE80",
          padding: "12px 20px",
          color: "#4ADE80",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
        onClick={() => alert("Instagram import coming next ♥")}
      >
        Import From Instagram
      </button>

      {imageUrl && (
        <div style={{ marginTop: "30px" }}>
          <h2 style={{ color: "#4ADE80", marginBottom: "10px" }}>
            Uploaded Image:
          </h2>
          <img
            src={imageUrl}
            alt="Uploaded"
            style={{ width: "300px", borderRadius: "8px" }}
          />
          <p style={{ marginTop: "10px", color: "#aaa" }}>{imageUrl}</p>
        </div>
      )}
    </div>
  );
}
