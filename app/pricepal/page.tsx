export default function PricePalPage() {
  return (
    <iframe
      src="https://pricepal.collectorconnector.com" // or your PricePal deployment URL
      style={{
        width: "100%",
        height: "100vh",
        border: "none",
        backgroundColor: "#000",
      }}
      title="PricePal"
    />
  );
}
