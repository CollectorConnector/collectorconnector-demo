// app/profile/[id]/page.tsx
"use client";

export default function ProfilePage() {
  return (
    <div className="p-6 text-white flex flex-col items-center">
      {/* Avatar */}
      <img
        src="/default-avatar.png"
        alt="Profile"
        className="w-24 h-24 object-cover border shadow"
        style={{ borderRadius: "35% / 30%" }}
      />

      {/* Name */}
      <h1 className="mt-4 text-2xl font-bold">Your Name</h1>

      {/* Username */}
      <p className="text-gray-400">@username</p>
    </div>
  );
}
