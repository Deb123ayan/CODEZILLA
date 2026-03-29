import Navbar from "@/components/Navbar";
import DashboardFooter from "@/components/DashboardFooter";

export default function HowItWorks() {
  return (
    <div className="bg-[#fcf9f8] text-[#1b1c1b] min-h-screen flex flex-col font-manrope">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 px-6 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#1b1c1b] tracking-tight mb-8">How It Works</h1>
        <div className="prose prose-lg text-[#434751] font-medium leading-relaxed font-inter space-y-6">
          <p>
            Zafby offers algorithmic income protection tailored specifically for Indian gig workers. This means that unpredictable issues like severe weather, low-demand zones, and immediate cash needs are managed by our automated system.
          </p>
          <h2 className="text-2xl font-extrabold text-[#1b1c1b] mt-8 mb-4">Monsoon & Heat Lock</h2>
          <p>
            When extreme Indian weather conditions hit—such as heavy monsoons or intense summer heatwaves—your gig platform earnings might take a hit if you can't ride. Zafby automatically detects severe weather conditions in your API profile's location and instantly allocates compensation to stabilize your income for the day.
          </p>
          <h2 className="text-2xl font-extrabold text-[#1b1c1b] mt-8 mb-4">Seamless Tracking</h2>
          <p>
            All you have to do is activate your Zafby shield and link your delivery platform profile to Zafby. We calculate the disruption algorithm in the background with zero clicks needed from you during emergencies.
          </p>
        </div>
      </main>
      <DashboardFooter className="mt-auto mx-0 py-8 rounded-none border-t border-[#e4e2e0]/50" />
    </div>
  );
}
