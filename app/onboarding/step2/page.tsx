"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Step2() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/auth/login");
        return;
      }

      setUserId(data.user.id);
      setLoading(false);
    }
    load();
  }, [router]);

  function handleFileChange(e: any) {
    const f = e.target.files?.[0];
    if (!f) return;

    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function next() {
    if (!file || !userId) {
      // Allow skipping avatar
      router.push("/onboarding/step3");
      return;
    }

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const avatarUrl = publicUrlData.publicUrl;

    localStorage.setItem("onboarding_avatar", avatarUrl);

    setUploading(false);
    router.push("/onboarding/step3");
  }

  if (loading) {
    return (
      <div className="auth-callback">
        <div className="spinner-large" />
      </div>
    );
  }

  return (
    <>
      <h1 className="auth-title">Add your avatar</h1>
      <p className="auth-subtitle">This helps others recognise you</p>

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            style={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              objectFit: "cover",
              margin: "0 auto",
              border: "4px solid #333",
            }}
          />
        ) : (
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              background: "#222",
              margin: "0 auto",
              border: "4px dashed #444",
            }}
          />
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ marginBottom: 24 }}
      />

      <button className="auth-submit" onClick={next} disabled={uploading}>
        {uploading && <span className="spinner" />}
        {uploading ? "Uploading..." : "Continue"}
      </button>

      <button
        onClick={() => router.push("/onboarding/step3")}
        className="auth-forgot"
      >
        Skip for now
      </button>
    </>
  );
}

