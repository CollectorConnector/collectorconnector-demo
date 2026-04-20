import BecomeSeller from "@/components/BecomeSeller";

export default function Page() {
  const user = { name: "Stacy", email: "stacy@example.com" }; // replace with real user

  return (
    <div>
      <h1>Your Account</h1>
      <BecomeSeller user={user} />
    </div>
  );
}
