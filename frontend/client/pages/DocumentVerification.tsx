import React, { useState } from "react";
import { Upload, ChevronRight, CheckCircle2, Loader2, FileText, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function DocumentVerification() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [aadharFile, setAadharFile] = useState<File | null>(null);
    const [panFile, setPanFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'aadhar' | 'pan') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (type === 'aadhar') {
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
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden font-inter">
            <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-40">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#2563eb]/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#10b981]/10 blur-[100px] rounded-full" />
            </div>

            <div className="w-full max-w-[500px] animate-in fade-in zoom-in duration-500">
                {/* Progress Indicator */}
                <div className="mb-8 flex items-center justify-between px-2">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-[#2563eb] text-white flex items-center justify-center text-xs font-bold">2</div>
                        <span className="text-sm font-semibold text-gray-900">Step 2 of 3</span>
                    </div>
                    <div className="flex space-x-1">
                        <div className="w-12 h-1.5 rounded-full bg-[#2563eb]" />
                        <div className="w-12 h-1.5 rounded-full bg-[#2563eb]" />
                        <div className="w-12 h-1.5 rounded-full bg-gray-200" />
                    </div>
                </div>

                <div className="bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 md:p-10 transition-all">
                    <div className="mb-10 text-center">
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Document Verification</h1>
                        <p className="text-gray-500 text-sm font-medium">Upload your Aadhaar and PAN for platform verification</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Aadhaar Upload */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Upload Aadhaar</label>
                            <label className={cn(
                                "relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:bg-gray-50",
                                aadharFile ? "border-[#10b981] bg-[#10b981]/5" : "border-gray-200"
                            )}>
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {aadharFile ? (
                                        <>
                                            <FileText className="w-8 h-8 text-[#10b981] mb-2" />
                                            <p className="text-sm font-medium text-[#10b981]">{aadharFile.name}</p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> Aadhaar</p>
                                            <p className="text-xs text-gray-400">PDF, JPG, or PNG (MAX. 5MB)</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,image/*"
                                    onChange={(e) => handleFileChange(e, 'aadhar')}
                                />
                            </label>
                        </div>

                        {/* PAN Upload */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Upload PAN Card</label>
                            <label className={cn(
                                "relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:bg-gray-50",
                                panFile ? "border-[#10b981] bg-[#10b981]/5" : "border-gray-200"
                            )}>
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {panFile ? (
                                        <>
                                            <FileText className="w-8 h-8 text-[#10b981] mb-2" />
                                            <p className="text-sm font-medium text-[#10b981]">{panFile.name}</p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> PAN</p>
                                            <p className="text-xs text-gray-400">PDF, JPG, or PNG (MAX. 5MB)</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,image/*"
                                    onChange={(e) => handleFileChange(e, 'pan')}
                                />
                            </label>
                        </div>

                        <div className="pt-4 flex flex-col space-y-4">
                            <button
                                type="submit"
                                disabled={loading || (!aadharFile && !panFile)}
                                className="w-full h-14 bg-[#2563eb] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center space-x-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <span>Verify & Continue</span>
                                        <ChevronRight size={18} />
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate("/buy-plan")}
                                className="w-full h-12 bg-transparent text-gray-400 hover:text-gray-900 font-bold text-[10px] uppercase tracking-[0.2em] transition-all"
                            >
                                Skip for now
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer Info */}
                <div className="mt-8 flex items-center justify-center space-x-3 text-gray-400">
                    <CheckCircle2 size={16} className="text-[#10b981]" />
                    <p className="text-[10px] font-bold uppercase tracking-widest leading-none">Your documents are securely encrypted</p>
                </div>
            </div>
        </div>
    );
}
