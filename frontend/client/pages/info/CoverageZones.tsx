import Navbar from "@/components/Navbar";
import DashboardFooter from "@/components/DashboardFooter";

export default function CoverageZones() {
  return (
    <div className="bg-[#fcf9f8] text-[#1b1c1b] min-h-screen flex flex-col font-manrope">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 px-6 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#1b1c1b] tracking-tight mb-8">Coverage Zones</h1>
        <div className="prose prose-lg text-[#434751] font-medium leading-relaxed font-inter space-y-6">
          <p>
            Zafby's Zone Guard provides gig workers with income stabilization in supported coverage zones.
          </p>
          <h2 className="text-2xl font-extrabold text-[#1b1c1b] mt-8 mb-4">Tier-1 & Tier-2 Stabilization</h2>
          <p>
            Working in low-demand tier-2 areas? We bridge the gap when daily orders slow down below an acceptable baseline. You shouldn't have to suffer from inconsistent gig availability in different pin codes.
          </p>
          <p>
            Zafby covers over 5,000 active zones across India, ensuring no geographic discrimination limits your earning potential. Check your dashboard to view the risk multiplier of your current registered location.
          </p>
        </div>
      </main>
      <DashboardFooter className="mt-auto mx-0 py-8 rounded-none border-t border-[#e4e2e0]/50" />
    </div>
  );
}
