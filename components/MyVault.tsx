useEffect(() => {
  // ensure we only run when we have a real userId and no initial data
  if (!userId || initial) return;

  let mounted = true;
  setLoading(true);
  setError(null);

  // capture a local string-typed uid so TS knows it's a string
  const uid: string = userId;

  async function load() {
    try {
      const res = await fetch(`/api/vault-stats?userId=${encodeURIComponent(uid)}`);
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const json = await res.json();
      if (!mounted) return;
      setStats({
        itemsCount: json.itemsCount ?? 0,
        categoriesCount: json.categoriesCount ?? 0,
        rarityScore: json.rarityScore ?? 0,
        topCategories: json.topCategories ?? DEFAULT_CATEGORIES,
      });
    } catch (err: any) {
      if (!mounted) return;
      setError(err?.message || "Failed to load vault stats");
    } finally {
      if (!mounted) return;
      setLoading(false);
    }
  }

  load();
  return () => {
    mounted = false;
  };
}, [userId, initial]);
