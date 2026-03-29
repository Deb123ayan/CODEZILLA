import Navbar from "@/components/Navbar";
import DashboardFooter from "@/components/DashboardFooter";

export default function HelpCenter() {
  return (
    <div className="bg-[#fcf9f8] text-[#1b1c1b] min-h-screen flex flex-col font-manrope">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 px-6 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#1b1c1b] tracking-tight mb-8">Help Center</h1>
        <div className="prose prose-lg text-[#434751] font-medium leading-relaxed font-inter space-y-6">
          <p>
            Need assistance with your Zafby account or gig platform integration? We've got you covered.
          </p>
          <h2 className="text-2xl font-extrabold text-[#1b1c1b] mt-8 mb-4">Frequently Asked Questions</h2>
          <ul className="list-disc pl-5 space-y-3 text-[#1b1c1b]">
            <li><strong>How do I activate my shield?</strong> - Visit the Registration page and connect your primary delivery platform API key.</li>
            <li><strong>How long do payouts take?</strong> - With supported banks, flash payouts take under 60 seconds to your linked UPI ID.</li>
            <li><strong>Which delivery platforms are supported?</strong> - We currently integrate with Zomato, Swiggy, Amazon, Flipkart, Blinkit, and Zepto.</li>
          </ul>
          <p className="mt-8">
            Still have questions? Email us at <strong className="text-[#004191]">support@zafby.co.in</strong>.
          </p>
        </div>
      </main>
      <DashboardFooter className="mt-auto mx-0 py-8 rounded-none border-t border-[#e4e2e0]/50" />
    </div>
  );
}
