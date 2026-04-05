async function startImport() {
  setLoading(true);
  try {
    const res = await fetch('/api/import-instagram', {
      method: 'POST',
      body: JSON.stringify({ igHandle: handle, userId })
    });
    
    const result = await res.json();

    if (!res.ok) {
      // This will now tell us if it's a 404 (no posts) or 500 (API key missing)
      alert(`Import Failed: ${result.error || 'Unknown Error'}`);
      return;
    }

    if (result.data) {
      const { error: insertError } = await supabase.from('items').insert(result.data);
      if (insertError) throw insertError;
      
      alert('Import Successful!');
      onClose();
      window.location.reload();
    }
  } catch (err: any) {
    alert(`Error: ${err.message}`);
  } finally {
    setLoading(false);
  }
}
