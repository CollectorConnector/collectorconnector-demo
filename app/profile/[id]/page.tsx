export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Inline edit states
  const [editMode, setEditMode] = useState(false);
  const [editedDisplayUrl, setEditedDisplayUrl] = useState("");
  const [editedBio, setEditedBio] = useState("");
  const [editedLocation, setEditedLocation] = useState("");
  const [editedTier, setEditedTier] = useState("");
  const [saving, setSaving] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [collections, setCollections] = useState<
  
  { id: string; title: string; nichem: string; cover_url: string | null; item_count: number | null }[]
>([]);

  useEffect(() => {
  if (!userId) return;

  async function loadCollections() {
    const { data, error } = await supabase
      .from("collections")
      .select("id, title, nichem, cover_url, item_count")
      .eq("user_id", userId);

    if (!error && data) {
      setCollections(data);
    }
  }

  loadCollections();
}, [userId]);


  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  useEffect(() => {
    if (!userId) {
      router.replace("/not-found");
      return;
    }

    async function loadData() {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) throw error;
        setProfile(data);

        if (data && currentUserId === userId) {
          setEditedDisplayUrl(data.display_url || "");
          setEditedBio(data.bio || "");
          setEditedLocation(data.location || "");
          setEditedTier(data.tier || "Standard");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userId, router, currentUserId]);

  useEffect(() => {
    if (!currentUserId || !userId || currentUserId === userId) return;

    async function checkFollow() {
      const { data } = await supabase
        .from("follows")
        .select("*")
        .eq("follower_id", currentUserId)
        .eq("following_id", userId)
        .maybeSingle();

      setIsFollowing(!!data);
    }

    checkFollow();
  }, [currentUserId, userId]);

  async function toggleFollow() {
    if (!currentUserId || currentUserId === userId) return;

   setFollowLoading(true);

    try {
      if (isFollowing) {
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", userId);

        setIsFollowing(false);
      } else {
        await supabase
          .from("follows")
          .insert({ follower_id: currentUserId, following_id: userId });

        setIsFollowing(true);
      }
    } finally {
      setFollowLoading(false);
    }
  }

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !currentUserId || currentUserId !== userId) return;

    setUploadingAvatar(true);

    try {
      const timestamp = Date.now();
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `avatar-${timestamp}.${fileExt}`;
      const filePath = `${currentUserId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true, cacheControl: "31536000" });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      console.log("Avatar public URL:", data.publicUrl);

      if (!data.publicUrl) throw new Error("No public URL – check bucket is PUBLIC");

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", currentUserId);

      if (updateError) throw updateError;

      setProfile((prev) => (prev ? { ...prev, avatar_url: data.publicUrl } : null));

      alert("Avatar updated! Refresh page to confirm.");
    } catch (err: any) {
      console.error("Avatar failed:", err);
      alert("Avatar update failed: " + (err.message || "Check console (F12)"));
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function saveProfileChanges() {
    if (!currentUserId || currentUserId !== userId) return;

    setSaving(true);

    try {
      const updates = {
        display_url: editedDisplayUrl.trim() || null,
        bio: editedBio.trim() || null,
        location: editedLocation.trim() || null,
        tier: editedTier || null,
      };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", currentUserId);

      if (error) throw error;

      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      setEditMode(false);
      alert("Profile saved!");
    } catch (err: any) {
      console.error("Save failed:", err);
      alert("Save failed: " + (err.message || "Check console"));
    } finally {
      setSaving(false);
    }
  }

  const displayName = useMemo(
    () => profile?.display_url || profile?.username || "Unnamed Collector",
    [profile]
  );

  const getTierIcon = (tier?: string | null) => {
    if (!tier) return null;
    const lower = tier.toLowerCase();

    if (lower.includes("bronze"))   return "/tier-badges/bronze.png";
    if (lower.includes("silver"))   return "/tier-badges/silver.png";
    if (lower.includes("gold"))     return "/tier-badges/gold.png";
    if (lower.includes("diamond"))  return "/tier-badges/diamond.png";
    if (lower.includes("founder"))  return "/tier-badges/founder.png";

    return null;
  };

  const tierIconSrc = getTierIcon(profile?.tier);

  const isOwnProfile = currentUserId === userId;

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <ProfileHeader />
        <div className="flex items-center justify-center h-[80vh] text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black text-white">
        <ProfileHeader />
        <div className="flex flex-col items-center mt-8 mb-6">
  <div className="relative">
    <Image
      src={profileImageUrl || "/default-avatar.png"}
      alt="Profile picture"
      width={140}
      height={140}
      className="rounded-full object-cover shadow-lg"
    />
