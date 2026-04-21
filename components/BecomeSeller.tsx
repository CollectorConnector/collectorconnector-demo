"use client";

export default function BecomeSeller({ user, status }: { user: any, status: "active" | "incomplete" | "none" }) {

  const handleBecomeSeller = async () => {
    let accountId = user.stripe_account_id; // FIXED FIELD NAME

    // STEP 1 — Create Stripe account if missing
    if (!accountId) {
      const res = await fetch("/api/stripe/create-account", {
        method: "POST",
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();

      if (!data.accountId) {
        alert("Could not create Stripe account");
        return;
      }

      accountId = data.accountId;
    }

    // STEP 2 — Start onboarding
    const onboardRes = await fetch("/api/stripe/onboard", {
      method: "POST",
      body: JSON.stringify({ accountId }),
    });

    const onboardData = await onboardRes.json();

    if (onboardData.link?.url) {
      window.location.href = onboardData.link.url;
    } else {
      alert("Could not start onboarding");
    }
  };

  // Fully onboarded
  if (status === "active") {
    return (
      <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '24px', textAlign: 'center' }}>
        <h3 style={{ fontWeight: '900', marginBottom: '16px' }}>Seller Dashboard</h3>
        <button className="w-full bg-white text-black p-4 rounded-xl font-black">GO TO DASHBOARD</button>
      </section>
    );
  }

  // Incomplete onboarding
  if (status === "incomplete") {
    return (
      <section style={{ background: '#09090b', border: '1px solid #f59e0b', borderRadius: '24px', padding: '24px', textAlign: 'center' }}>
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
    <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '24px', textAlign: 'center' }}>
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
