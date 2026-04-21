"use client";

export default function BecomeSeller({ user, status }: { user: any, status: "active" | "incomplete" | "none" }) {
  
  // Logic for fully onboarded sellers
  if (status === "active") {
    return (
      <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '24px', textAlign: 'center' }}>
        <h3 style={{ fontWeight: '900', marginBottom: '16px' }}>Seller Dashboard</h3>
        <button className="w-full bg-white text-black p-4 rounded-xl font-black">GO TO DASHBOARD</button>
      </section>
    );
  }

  // Logic for incomplete onboarding
  if (status === "incomplete") {
    return (
      <section style={{ background: '#09090b', border: '1px solid #f59e0b', borderRadius: '24px', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '16px', color: '#f59e0b' }}>⚠️ Your seller account is incomplete</p>
        <button 
          onClick={() => window.location.href = '/api/stripe/onboard'} 
          className="w-full bg-[#f59e0b] text-black p-4 rounded-xl font-black"
        >
          CONTINUE ONBOARDING
        </button>
      </section>
    );
  }

  // Default: Prompt to start
  return (
    <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '24px', textAlign: 'center' }}>
      <p style={{ fontWeight: 'bold', marginBottom: '16px' }}>Start selling on CollectorConnector</p>
      <button 
        onClick={() => window.location.href = '/api/stripe/onboard'} 
        style={{ width: '100%', background: '#fff', color: '#000', padding: '16px', borderRadius: '16px', fontWeight: '900' }}
      >
        BECOME A SELLER
      </button>
    </section>
  );
}
