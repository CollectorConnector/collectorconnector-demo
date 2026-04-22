<div
  key={item.id}
  onClick={() => router.push(`/collections/${item.collection}`)}
  style={{
    position: "relative",
    aspectRatio: "1/1",
    borderRadius: "20px",
    overflow: "hidden",
    border: "1px solid #27272a",
    background: "#09090b",
    cursor: "pointer",
  }}
>
  <img
    src={item.image_url}
    alt={item.title}
    style={{ width: "100%", height: "100%", objectFit: "cover" }}
  />

  {/* PRICE BADGE */}
  {item.price && (
    <div
      style={{
        position: "absolute",
        top: "8px",
        right: "8px",
        background: "#22c55e",
        color: "#000",
        padding: "4px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "800",
        zIndex: 20,
      }}
    >
      £{item.price}
    </div>
  )}

  {/* TITLE BAR */}
  <div
    style={{
      position: "absolute",
      bottom: "0",
      width: "100%",
      background: "rgba(0,0,0,0.6)",
      padding: "6px",
      textAlign: "center",
      fontSize: "12px",
      fontWeight: "700",
    }}
  >
    {item.title || "Untitled"}
  </div>
</div>
