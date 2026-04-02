const [collections, setCollections] = useState([]);

useEffect(() => {
  const loadCollections = async () => {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return;

    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error) setCollections(data);
  };

  loadCollections();
}, []);

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
