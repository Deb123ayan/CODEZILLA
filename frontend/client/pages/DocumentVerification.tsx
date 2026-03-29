import React, { useState } from "react";
import { Upload, ChevronRight, CheckCircle2, Loader2, FileText, X, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function DocumentVerification() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "aadhar" | "pan") => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === "aadhar") {
        setAadharFile(file);
      } else {
        setPanFile(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aadharFile || !panFile) {
      toast.error("Please upload both Aadhaar and PAN documents");
      return;
    }

    setLoading(true);
    // Simulate API call for document upload
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);

    toast.success("Documents verified successfully!");
    navigate("/buy-plan"); // Step 3
  };

  return (
    <div className="bg-[#fdf8f8] text-[#1c1b1b] antialiased min-h-screen flex flex-col font-inter">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-4 bg-[#fdf8f8]/90 backdrop-blur-md shadow-[0px_24px_48px_-12px_rgba(28,27,27,0.02)]">
        <div className="text-2xl font-black tracking-tighter text-[#1c1b1b]">Zafby</div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow pt-32 pb-40 px-6 flex flex-col items-center justify-center max-w-5xl mx-auto w-full">
        {/* Architectural Header Section */}
        <section className="w-full text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 text-[#1c1b1b]">
            Document Verification
          </h1>
          <p className="text-[#424753] text-lg max-w-xl mx-auto font-medium opacity-80">
            Upload your Aadhaar and PAN card for instant verification.
          </p>
        </section>

        {/* Progress Indicator Block */}
        <div className="w-full max-w-2xl mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <div className="flex justify-between items-end mb-4">
            <span className="text-[#004191] font-bold text-sm tracking-widest uppercase">
              Step 2 of 3
            </span>
            <span className="text-[#424753] font-semibold text-xs">66% Complete</span>
          </div>
          <div className="w-full h-2 bg-[#f1edec] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#004191] to-[#0058be] w-[66%] rounded-full transition-all duration-1000"></div>
          </div>
        </div>

        {/* Bento-Style Grid for Document Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          
          {/* Aadhaar Card Dropzone */}
          <label
            className={cn(
              "group relative bg-[#ffffff] rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer shadow-[0px_24px_48px_-12px_rgba(28,27,27,0.06)] hover:shadow-[0px_32px_64px_-16px_rgba(28,27,27,0.12)] transition-all duration-500 border-2 min-h-[320px]",
              aadharFile ? "border-[#0058be]/40 bg-[#d8e2ff]/10" : "border-dashed border-[#c2c6d5]/40 hover:border-[#004191]/40"
            )}
          >
            <div
              className={cn(
                "mb-6 p-6 rounded-full transition-colors duration-500",
                aadharFile ? "bg-[#d8e2ff] text-[#004191]" : "bg-[#f7f2f2] group-hover:bg-[#d8e2ff] text-[#004191]"
              )}
            >
              {aadharFile ? <FileText size={40} /> : <Upload size={40} />}
            </div>
            
            <h3 className="text-xl font-bold mb-2 text-[#1c1b1b]">
               {aadharFile ? "Aadhaar Selected" : "Aadhaar Card"}
            </h3>
            
            <p className="text-[#424753] text-sm font-medium">
              {aadharFile ? aadharFile.name : "Click to upload or drag & drop"}
            </p>
            
            <input
              type="file"
              className="hidden"
              accept=".pdf,image/*"
              onChange={(e) => handleFileChange(e, "aadhar")}
            />
            {aadharFile && (
               <div
                  className="absolute top-4 right-4 p-2 bg-[#ffffff] shadow-md rounded-full text-[#1c1b1b] hover:bg-[#ba1a1a] hover:text-[#ffffff] transition-colors"
                  onClick={(e) => { e.preventDefault(); setAadharFile(null); }}
               >
                 <X size={16} />
               </div>
            )}
          </label>

          {/* PAN Card Dropzone */}
          <label
            className={cn(
              "group relative bg-[#ffffff] rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer shadow-[0px_24px_48px_-12px_rgba(28,27,27,0.06)] hover:shadow-[0px_32px_64px_-16px_rgba(28,27,27,0.12)] transition-all duration-500 border-2 min-h-[320px]",
              panFile ? "border-[#0058be]/40 bg-[#d8e2ff]/10" : "border-dashed border-[#c2c6d5]/40 hover:border-[#004191]/40"
            )}
          >
            <div
              className={cn(
                "mb-6 p-6 rounded-full transition-colors duration-500",
                panFile ? "bg-[#d8e2ff] text-[#004191]" : "bg-[#f7f2f2] group-hover:bg-[#d8e2ff] text-[#004191]"
              )}
            >
              {panFile ? <FileText size={40} /> : <Upload size={40} />}
            </div>
            
            <h3 className="text-xl font-bold mb-2 text-[#1c1b1b]">
               {panFile ? "PAN Selected" : "PAN Card"}
            </h3>
            
            <p className="text-[#424753] text-sm font-medium">
              {panFile ? panFile.name : "Click to upload or drag & drop"}
            </p>
            
            <input
              type="file"
              className="hidden"
              accept=".pdf,image/*"
              onChange={(e) => handleFileChange(e, "pan")}
            />
            {panFile && (
               <div
                  className="absolute top-4 right-4 p-2 bg-[#ffffff] shadow-md rounded-full text-[#1c1b1b] hover:bg-[#ba1a1a] hover:text-[#ffffff] transition-colors"
                  onClick={(e) => { e.preventDefault(); setPanFile(null); }}
               >
                 <X size={16} />
               </div>
            )}
          </label>

        </div>

        {/* Security Badge Footer Inside Canvas */}
        {/* <div className="mt-16 flex items-center gap-3 py-4 px-8 bg-[#f1edec] rounded-full opacity-70 animate-in fade-in duration-1000 delay-300">
          <ShieldCheck className="text-[#004191]" size={20} />
          <span className="text-xs font-bold tracking-wider text-[#424753] uppercase">
            Encrypted Security
          </span>
        </div> */}
      </main>

      {/* BottomNavBar (Transaction Shell) */}
      <footer className="fixed bottom-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-10 py-6 md:py-8 bg-[#ffffff]/90 backdrop-blur-xl rounded-t-[1.5rem] shadow-[0px_-10px_30px_rgba(0,0,0,0.03)] border-t border-[#f1edec]">
        <button
          className="hidden md:flex flex-col items-center justify-center text-[#1c1b1b] px-8 py-3 font-semibold text-xs uppercase tracking-widest hover:translate-y-[-2px] transition-all duration-300"
          onClick={() => navigate(-1)}
        >
          Back
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading || (!aadharFile && !panFile)}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-br from-[#004191] to-[#0058be] text-[#ffffff] rounded-[1.5rem] px-10 py-4 font-semibold text-xs uppercase tracking-widest hover:shadow-[0_10px_20px_rgba(0,88,190,0.2)] transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
             <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
               <span>Verify & Continue</span>
               <ChevronRight size={18} />
            </>
          )}
        </button>

        <button
          onClick={() => navigate("/buy-plan")}
          className="hidden md:flex flex-col items-center justify-center text-[#1c1b1b] px-8 py-3 font-semibold text-xs uppercase tracking-widest opacity-50 hover:opacity-100 transition-all duration-300"
        >
          Skip for now
        </button>
      </footer>
    </div>
  );
}
