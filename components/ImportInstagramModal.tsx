const handleImport = async () => {
  setLoading(true);
  try {
    // 1. Scraping directly from the user's browser to avoid the block
    const response = await fetch(`https://www.instagram.com/${igHandle}/?__a=1&__d=dis`);
    const data = await response.json();
    const posts = data.graphql?.user?.edge_owner_to_timeline_media?.edges || [];

    if (posts.length === 0) {
      alert("Instagram blocked the request. Try again in a few minutes.");
      return;
    }

    // 2. Send the ALREADY FOUND posts to your API to be downloaded/saved
    const apiRes = await fetch('/api/import-instagram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        posts: posts.map((p: any) => ({
          display_url: p.node.display_url,
          caption: p.node.edge_media_to_caption?.edges[0]?.node?.text || ''
        })),
        userId: userId 
      }),
    });

    if (apiRes.ok) {
      alert("Importing... check your Curator Inbox in 10 seconds!");
      onClose();
    }
  } catch (err) {
    alert("Error: Instagram is playing hard to get. Try a different handle or wait.");
  } finally {
    setLoading(false);
  }
};
