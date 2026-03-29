import Navbar from "@/components/Navbar";
import DashboardFooter from "@/components/DashboardFooter";

export default function BankIntegrations() {
  return (
    <div className="bg-[#fcf9f8] text-[#1b1c1b] min-h-screen flex flex-col font-manrope">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 px-6 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#1b1c1b] tracking-tight mb-8">Bank Integrations</h1>
        <div className="prose prose-lg text-[#434751] font-medium leading-relaxed font-inter space-y-6">
          <p>
            We've integrated directly with major national banks in India so that we can credit your earnings to your account the very second an algorithmic payout is approved.
          </p>
          <h2 className="text-2xl font-extrabold text-[#1b1c1b] mt-8 mb-4">Supported Partners</h2>
          <ul className="list-disc pl-5 space-y-2 text-[#434751]">
            <li>HDFC Bank</li>
            <li>ICICI Bank</li>
            <li>State Bank of India (SBI)</li>
            <li>Axis Bank</li>
            <li>Kotak Mahindra Bank</li>
            <li>All UPI-enabled payment apps (PhonePe, Google Pay, Paytm, BHIM)</li>
          </ul>
          <p className="mt-8">
            Our bank integrations guarantee that your money reaches you within 60 seconds of a disrupted order, day or night across the NPCI infrastructure.
          </p>
        </div>
      </main>
      <DashboardFooter className="mt-auto mx-0 py-8 rounded-none border-t border-[#e4e2e0]/50" />
    </div>
  );
}
