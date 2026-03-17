"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiSearch } from "react-icons/fi";
import { FiTwitter, FiInstagram, FiLinkedin } from "react-icons/fi";

type ProfilePageProps = {
  params: {
    id: string;
  };
};

export default function ProfilePage({ params }: ProfilePageProps) {
  const { id } = params;

  // TODO: Replace this with your real data fetching (e.g. fetch(`/api/profile/${id}`) or a custom hook)
  const [profile, setProfile] = useState<{
    name: string;
    bio: string;
  } | null>(null);

  useEffect(() => {
    // Placeholder: simulate async load
    setTimeout(() => {
      setProfile({
        name: `Collector ${id}`,
        bio: "This is a placeholder bio. Replace with real profile data.",
      });
    }, 200);
  }, [id]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="max-w-5xl mx-auto px-4 pt-8 pb-16">
        {profile ? (
          <section>
            <h1 className="text-3xl font-semibold mb-2">{profile.name}</h1>
            <p className="text-sm text-neutral-300">{profile.bio}</p>
          </section>
        ) : (
          <p className="text-sm text-neutral-500">Loading profile…</p>
        )}
      </main>
    </div>
  );
}

function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Click-outside to collapse search
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    }

    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen]);

  // Auto-focus when search opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleToggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
  };

  return (
    <header className="border-b border-neutral-900">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo as home button */}
        <Link
          href="/"
          className="flex items-center"
          style={{ cursor: "pointer" }}
        >
          <div className="transition-opacity duration-150 hover:opacity-80">
            <Image
              src="/CC-main-logo.png"
              alt="CollectorConnector"
              width={120}
              height={32}
              priority
            />
          </div>
        </Link>

        {/* Right side: search + social */}
        <div className="flex items-center gap-4">
          {/* Search container */}
          <div
            ref={searchContainerRef}
            className="flex items-center gap-2"
          >
            {/* Magnifying glass (16px) */}
            <button
              type="button"
              onClick={handleToggleSearch}
              className="relative flex items-center justify-center"
              aria-label="Toggle search"
            >
              <FiSearch
                size={16}
                className={`transition-opacity duration-300 ${
                  isSearchOpen ? "opacity-0" : "opacity-100"
                }`}
              />
            </button>

            {/* Expanding search bar */}
            <div
              className={`
                overflow-hidden transition-[width,background-color] 
                duration-300 ease-out
                ${isSearchOpen ? "w-56" : "w-0"}
              `}
            >
              <div
                className={`
                  h-9 flex items-center px-3 rounded-lg
                  transition-colors duration-200
                  ${isSearchOpen ? "bg-[#1a1a1a]" : "bg-transparent"}
                `}
              >
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full bg-transparent outline-none border-none text-sm text-white placeholder-transparent"
                  // No placeholder text as requested
                />
              </div>
            </div>
          </div>

          {/* Social icons (static, 14px) */}
          <div className="flex items-center gap-3 text-neutral-300">
            <a
              href="#"
              aria-label="Twitter"
              className="flex items-center justify-center"
            >
              <FiTwitter size={14} />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="flex items-center justify-center"
            >
              <FiInstagram size={14} />
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              className="flex items-center justify-center"
            >
              <FiLinkedin size={14} />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
