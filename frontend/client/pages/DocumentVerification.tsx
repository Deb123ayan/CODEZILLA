import React, { useState } from "react";
import { Upload, ChevronRight, CheckCircle2, Loader2, FileText, X, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useUserAuth } from "@/context/UserAuthContext";
import { api } from "@/lib/api-client";
import BrandLogo from "@/components/BrandLogo";

export default function DocumentVerification() {
  const navigate = useNavigate();
  const { phoneNumber } = useUserAuth();
  const [loading, setLoading] = useState(false);
  const [aadharFront, setAadharFront] = useState<File | null>(null);
  const [aadharBack, setAadharBack] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "aadhar_front" | "aadhar_back" | "pan") => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === "aadhar_front") setAadharFront(file);
      else if (type === "aadhar_back") setAadharBack(file);
      else setPanFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aadharFront || !panFile) {
      toast.error("Please upload at least Aadhaar Front and PAN");
      return;
    }

    if (!phoneNumber) {
      toast.error("Session expired. Please login again.");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("phone", phoneNumber);
      formData.append("aadhar_front", aadharFront);
      if (aadharBack) formData.append("aadhar_back", aadharBack);
      formData.append("pan", panFile);

      const response = await api.post<any>("/auth/document/verify/", formData);
      
      if (response.verdict === "VERIFIED") {
        toast.success("Documents verified successfully!");
      } else {
        toast.warning("Documents uploaded for review.");
      }
      
      navigate("/buy-plan"); 
    } catch (error: any) {
      toast.error(error.message || "Failed to upload documents");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fdf8f8] text-[#1c1b1b] antialiased min-h-screen flex flex-col font-inter">
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-4 bg-[#fdf8f8]/90 backdrop-blur-md shadow-[0px_24px_48px_-12px_rgba(28,27,27,0.02)]">
        <BrandLogo />
      </header>

      <main className="flex-grow pt-32 pb-40 px-6 flex flex-col items-center justify-center max-w-6xl mx-auto w-full">
        <section className="w-full text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 text-[#1c1b1b]">
            Document Verification
          </h1>
          <p className="text-[#424753] text-lg max-w-xl mx-auto font-medium opacity-80">
            Upload your Aadhaar (Front & Back) and PAN card.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          
          {/* Aadhaar Front */}
          <label className={cn(
            "group relative bg-[#ffffff] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer shadow-sm hover:shadow-md transition-all duration-500 border-2 min-h-[280px]",
            aadharFront ? "border-[#0058be]/40 bg-[#d8e2ff]/10" : "border-dashed border-[#c2c6d5]/40 hover:border-[#004191]/40"
          )}>
            <div className={cn("mb-4 p-5 rounded-full transition-colors", aadharFront ? "bg-[#d8e2ff] text-[#004191]" : "bg-[#f7f2f2] text-[#004191]")}>
              {aadharFront ? <FileText size={32} /> : <Upload size={32} />}
            </div>
            <h3 className="text-lg font-bold mb-1">Aadhaar Front</h3>
            <p className="text-xs text-[#424753]">{aadharFront ? aadharFront.name : "Tap to upload"}</p>
            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, "aadhar_front")} />
          </label>

          {/* Aadhaar Back */}
          <label className={cn(
            "group relative bg-[#ffffff] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer shadow-sm hover:shadow-md transition-all duration-500 border-2 min-h-[280px]",
            aadharBack ? "border-[#0058be]/40 bg-[#d8e2ff]/10" : "border-dashed border-[#c2c6d5]/40 hover:border-[#004191]/40"
          )}>
            <div className={cn("mb-4 p-5 rounded-full transition-colors", aadharBack ? "bg-[#d8e2ff] text-[#004191]" : "bg-[#f7f2f2] text-[#004191]")}>
              {aadharBack ? <FileText size={32} /> : <Upload size={32} />}
            </div>
            <h3 className="text-lg font-bold mb-1">Aadhaar Back</h3>
            <p className="text-xs text-[#424753]">{aadharBack ? aadharBack.name : "Tap to upload (Optional)"}</p>
            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, "aadhar_back")} />
          </label>

          {/* PAN Card */}
          <label className={cn(
            "group relative bg-[#ffffff] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer shadow-sm hover:shadow-md transition-all duration-500 border-2 min-h-[280px]",
            panFile ? "border-[#0058be]/40 bg-[#d8e2ff]/10" : "border-dashed border-[#c2c6d5]/40 hover:border-[#004191]/40"
          )}>
            <div className={cn("mb-4 p-5 rounded-full transition-colors", panFile ? "bg-[#d8e2ff] text-[#004191]" : "bg-[#f7f2f2] text-[#004191]")}>
              {panFile ? <FileText size={32} /> : <Upload size={32} />}
            </div>
            <h3 className="text-lg font-bold mb-1">PAN Card</h3>
            <p className="text-xs text-[#424753]">{panFile ? panFile.name : "Tap to upload"}</p>
            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, "pan")} />
          </label>

        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full z-50 flex justify-between items-center px-10 py-8 bg-[#ffffff]/90 backdrop-blur-xl border-t border-[#f1edec]">
        <button className="text-[#1c1b1b] font-semibold text-xs uppercase tracking-widest" onClick={() => navigate(-1)}>Back</button>
        <button
          onClick={handleSubmit}
          disabled={loading || !aadharFront || !panFile}
          className="bg-gradient-to-br from-[#004191] to-[#0058be] text-[#ffffff] rounded-full px-12 py-4 font-bold text-xs uppercase tracking-widest"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : "Verify & Continue"}
        </button>
        <button onClick={() => navigate("/buy-plan")} className="text-[#1c1b1b] opacity-50 font-bold text-xs uppercase tracking-widest">Skip</button>
      </footer>
    </div>
  );
}