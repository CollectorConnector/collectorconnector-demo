<div
  key={user.id}
  className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-2xl p-5"
>
  <div className="flex flex-col">
    <p className="font-semibold text-xl truncate">
      {user.display_url || user.username}
    </p>
    <p className="text-zinc-400">@{user.username || "collector"}</p>
  </div>

  <button
    onClick={() => handleUnfollow(user.id)}
    className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-xl text-sm font-medium"
  >
    Remove
  </button>
</div>
