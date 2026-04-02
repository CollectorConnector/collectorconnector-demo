<div className="mt-4">
  <label className="block text-sm font-medium mb-1">Choose a collection</label>
  <select
    value={selectedCollectionId}
    onChange={(e) => setSelectedCollectionId(e.target.value)}
    className="w-full border rounded px-3 py-2"
  >
    <option value="">Select a collection…</option>

    {collections.map((c) => (
      <option key={c.id} value={c.id}>
        {c.title}
      </option>
    ))}
  </select>
</div>
