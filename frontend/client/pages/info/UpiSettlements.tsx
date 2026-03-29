import Navbar from "@/components/Navbar";
import DashboardFooter from "@/components/DashboardFooter";

export default function UpiSettlements() {
  return (
    <div className="bg-[#fcf9f8] text-[#1b1c1b] min-h-screen flex flex-col font-manrope">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 px-6 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#1b1c1b] tracking-tight mb-8">UPI Settlements</h1>
        <div className="prose prose-lg text-[#434751] font-medium leading-relaxed font-inter space-y-6">
          <p>
            We believe that money you earned yesterday should be available to you today.
          </p>
          <h2 className="text-2xl font-extrabold text-[#1b1c1b] mt-8 mb-4">UPI Flash Payouts</h2>
          <p>
            Traditional coverage models require days (or even weeks) of waiting and paperwork to claim compensation. Zafby's UPI Flash Payouts utilize instant IMPS and UPI networks to deliver approved algorithm payouts in under 60 seconds.
          </p>
          <p>
            Simply link your Virtual Payment Address (VPA) via the Dashboard settings and you're good to go.
          </p>
        </div>
      </main>
      <DashboardFooter className="mt-auto mx-0 py-8 rounded-none border-t border-[#e4e2e0]/50" />
    </div>
  );
}
