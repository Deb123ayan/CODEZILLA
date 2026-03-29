import Navbar from "@/components/Navbar";
import DashboardFooter from "@/components/DashboardFooter";

export default function PrivacyPolicy() {
  return (
    <div className="bg-[#fcf9f8] text-[#1b1c1b] min-h-screen flex flex-col font-manrope">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 px-6 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#1b1c1b] tracking-tight mb-8">Privacy Policy</h1>
        <div className="prose prose-lg text-[#434751] font-medium leading-relaxed font-inter space-y-6">
          <p>
            Valid as of March 2026. Zafby India Pvt. Ltd. respects your privacy and is committed to protecting your personal data in compliance with the Digital Personal Data Protection Act (DPDP Act), India.
          </p>
          <h2 className="text-2xl font-extrabold text-[#1b1c1b] mt-8 mb-4">Data Collection & Usage</h2>
          <p>
            When you register for algorithmic income protection, we collect necessary API telemetry from your gig platforms (such as Swiggy, Zomato, etc.) to calculate disruption events. 
            This data is used solely for the purpose of identifying payout events and is never sold or shared with any unassociated third parties.
          </p>
          <h2 className="text-2xl font-extrabold text-[#1b1c1b] mt-8 mb-4">Data Security</h2>
          <p>
            Your UPI details and platform credentials are encrypted and stored in RBI-compliant secure vaults. Rest assured, your data is handled with bank-grade security protocols.
          </p>
        </div>
      </main>
      <DashboardFooter className="mt-auto mx-0 py-8 rounded-none border-t border-[#e4e2e0]/50" />
    </div>
  );
}
