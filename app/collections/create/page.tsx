"use client";

import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CreateCollectionPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [niche, setNiche] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function resizeImage(file: File, maxSize: number): Promise<File> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: file.type }));
            } else {
              resolve(file);
            }
          },
          file.type,
          0.85
        );
      };
    });
  }

  function handleCoverChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverFile(file);
    setPreviewImage(URL.createObjectURL(file));
  }

  async function createCollection() {
    if (!title.trim()) {
      alert("Please enter a collection title.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not logged in");

      let coverUrl: string | null = null;

      if (coverFile) {
        const resized = await resizeImage(coverFile, 512);

        const timestamp = Date.now();
        const ext = coverFile.name.split(".").pop() || "jpg";
        const fileName = `cover-${timestamp}.${ext}`;
        const filePath = `${user.id}/collections/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("collection-covers")
          .upload(filePath, resized, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("collection-covers")
          .getPublicUrl(filePath);

        coverUrl = urlData.publicUrl;
      }

      const { data, error: insertError } = await supabase
        .from("collections")
        .insert({
          user_id: user.id,
          title: title.trim(),
          niche: niche.trim() || null,
          cover_url: coverUrl,
          item_count: 0,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      router.push(`/collections/${data.id}/add-item`);
    } catch (err: any) {
      console.error("Create collection failed:", err);
      alert("Failed to create collection: " + (err.message || "Check console"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        padding: "40px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
        }}
      >
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          Create Collection
        </h1>

        {/* COVER PREVIEW + CC LOGO UPLOAD BUTTON */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <label
            htmlFor="cover-upload"
            style={{ cursor: "pointer", textAlign: "center" }}
          >
            <div
              style={{
                width: 96, // smaller box
                height: 96,
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid #3f3f46",
                boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
                backgroundColor: "#18181b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Cover Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <img
                  src="/CC-main-logo.png"
                  alt="Upload Cover"
                  style={{
                    width: 24, // much smaller logo
                    opacity: 0.6,
                  }}
                />
              )}
            </div>

            <div
              style={{
                marginTop: 8,
                color: "#60a5fa",
                fontSize: 14,
              }}
            >
              Choose Cover Image
            </div>
          </label>

          <input
            id="cover-upload"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleCoverChange}
          />
        </div>

        {/* TITLE */}
        <div style={{ width: "100%" }}>
          <label
            style={{
              display: "block",
              fontSize: 16,
              marginBottom: 8,
            }}
          >
            Collection Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 12,
              backgroundColor: "#18181b",
              border: "1px solid #3f3f46",
              color: "#fff",
              fontSize: 15,
            }}
          />
        </div>

        {/* NICHE */}
        <div style={{ width: "100%" }}>
          <label
            style={{
              display: "block",
              fontSize: 16,
              marginBottom: 8,
            }}
          >
            Niche (optional)
          </label>
          <input
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 12,
              backgroundColor: "#18181b",
              border: "1px solid #3f3f46",
              color: "#fff",
              fontSize: 15,
            }}
          />
        </div>

        {/* CREATE BUTTON */}
        <button
          onClick={createCollection}
          disabled={saving}
          style={{
            width: "100%",
            padding: "14px 0",
            borderRadius: 999,
            backgroundColor: saving ? "#2563eb" : "#2563eb",
            opacity: saving ? 0.6 : 1,
            color: "#fff",
            fontSize: 18,
            fontWeight: 600,
            border: "none",
          }}
        >
          {saving ? "Creating..." : "Create Collection"}
        </button>
      </div>
    </div>
  );
}
