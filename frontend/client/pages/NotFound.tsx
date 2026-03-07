import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Zap, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white selection:bg-black selection:text-white section-padding">
      <div className="max-w-md w-full text-center space-y-12 reveal active">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-black rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl animate-bounce">
            <Zap size={40} className="text-blue-500 fill-current" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full border-4 border-white flex items-center justify-center">
            <span className="text-white font-black text-[10px]">!</span>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-7xl font-black tracking-tighter text-gray-900 leading-none italic">Lost in the <br /><span className="text-gray-300 not-italic">Fog.</span></h1>
          <p className="text-lg font-bold text-gray-400 tracking-tight leading-relaxed max-w-xs mx-auto">
            The route <span className="text-black">{location.pathname}</span> doesn't exist in our protection network.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center space-x-3 px-10 py-5 bg-black text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-blue-600 transition-all duration-500 hover:scale-105 active:scale-95"
        >
          <ArrowLeft size={16} />
          <span>Return to Base</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
