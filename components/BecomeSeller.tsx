"use client";

export default function BecomeSeller({ user, status }: { user: any, status: "active" | "incomplete" | "none" }) {

  const handleBecomeSeller = async () => {
    try {
      let accountId = user.stripe_account_id;

      // STEP 1 — Create Stripe account if missing
      if (!accountId) {
        const res = await fetch("/api/stripe/create-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || data.error || "Failed to create Stripe account");
        }

        accountId = data.accountId;
      }

      // STEP 2 — Start onboarding
      const onboardRes = await fetch("/api/stripe/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });

      const onboardData = await onboardRes.json();

      if (onboardRes.ok && onboardData.link?.url) {
        window.location.href = onboardData.link.url;
      } else {
        throw new Error(onboardData.message || onboardData.error || "Could not start onboarding");
      }
    } catch (err: any) {
      console.error("Stripe Onboarding Error:", err);
      alert(err.message || "An unexpected error occurred during onboarding setup.");
    }
  };

  // Fully onboarded: Gold Toggle State
  if (status === "active") {
    return (
      <div style={{ 
        background: 'linear-gradient(135deg, #F5AF02 0%, #D49600 100%)', 
        padding: '1px', 
        borderRadius: '16px',
        marginBottom: '20px'
      }}>
        <div style={{ 
          background: '#09090b', 
          borderRadius: '15px', 
          padding: '16px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '10px',
          color: '#F5AF02',
          fontWeight: '900'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          SELLER
        </div>
      </div>
    );
  }

  // Incomplete onboarding
  if (status === "incomplete") {
    return (
      <section style={{ background: '#09090b', border: '1px solid #f59e0b', borderRadius: '24px', padding: '24px', textAlign: 'center', marginBottom: '20px' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '16px', color: '#f59e0b' }}>⚠️ Your seller account is incomplete</p>
        <button 
          onClick={handleBecomeSeller}
          className="w-full bg-[#f59e0b] text-black p-4 rounded-xl font-black"
        >
          CONTINUE ONBOARDING
        </button>
      </section>
    );
  }

  // Default: Start selling
  return (
    <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '24px', textAlign: 'center', marginBottom: '20px' }}>
      <p style={{ fontWeight: 'bold', marginBottom: '16px' }}>Start selling on CollectorConnector</p>
      <button 
        onClick={handleBecomeSeller}
        style={{ width: '100%', background: '#fff', color: '#000', padding: '16px', borderRadius: '16px', fontWeight: '900' }}
      >
        BECOME A SELLER
      </button>
    </section>
  );
}
