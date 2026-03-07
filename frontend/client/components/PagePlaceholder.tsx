import Sidebar from "@/components/Sidebar";
import { ArrowRight } from "lucide-react";

interface PagePlaceholderProps {
  title: string;
  description: string;
  isAdmin?: boolean;
}

export default function PagePlaceholder({
  title,
  description,
  isAdmin = false,
}: PagePlaceholderProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isAdmin={isAdmin} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto md:ml-0">
        <div className="flex items-center justify-center min-h-screen px-4 pt-16 md:pt-0">
          <div className="max-w-md text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                <ArrowRight className="text-blue-600" size={32} />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-3">{title}</h1>

            <p className="text-gray-600 mb-8">{description}</p>

            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <p className="text-blue-900 font-medium mb-2">Page under development</p>
              <p className="text-blue-800 text-sm">
                Continue prompting to have this page built out with your requirements.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
