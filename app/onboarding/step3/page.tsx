"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Step3() {
  const router = useRouter();

  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");

  function next() {
    localStorage.setItem("onboarding_bio", bio);
    localStorage.setItem("onboarding_interests", interests);
    router.push("/onboarding/finish");
  }

  return (
    <>
      <h1 className="auth-title">Tell us about you</h1>
      <p className="auth-subtitle">Optional, but helps personalise your profile</p>

      <div className="auth-form">
        <textarea
          className="auth-input"
          placeholder="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          style={{ minHeight: 100 }}
        />

        <input
          className="auth-input"
          placeholder="Your interests (comma separated)"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
        />

        <button className="auth-submit" onClick={next}>
          Continue
        </button>
      </div>
    </>
  );
}

