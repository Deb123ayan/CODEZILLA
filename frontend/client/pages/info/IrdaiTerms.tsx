import Navbar from "@/components/Navbar";
import DashboardFooter from "@/components/DashboardFooter";

export default function IrdaiTerms() {
  return (
    <div className="bg-[#fcf9f8] text-[#1b1c1b] min-h-screen flex flex-col font-manrope">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 px-6 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#1b1c1b] tracking-tight mb-8">IRDAI Terms</h1>
        <div className="prose prose-lg text-[#434751] font-medium leading-relaxed font-inter space-y-6">
          <p>
            Zafby operates under the strict guidelines mandated by the Insurance Regulatory and Development Authority of India (IRDAI). 
          </p>
          <h2 className="text-2xl font-extrabold text-[#1b1c1b] mt-8 mb-4">Underwriting Partners</h2>
          <p>
            Zafby is an authorized algorithmic risk assessment distributor. All core insurance products backing our automated payouts are underwritten by primary IRDAI registered insurance providers inside India. 
          </p>
          <p>
            Payouts triggered by Zafby algorithms are legally binding as parametric micro-insurance events as per circulars relating to digital gig income disruption protection under IRDAI frameworks.
          </p>
        </div>
      </main>
      <DashboardFooter className="mt-auto mx-0 py-8 rounded-none border-t border-[#e4e2e0]/50" />
    </div>
  );
}
