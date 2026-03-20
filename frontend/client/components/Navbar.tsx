import { Link } from "react-router-dom";
import { Menu, X, ArrowRight, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      // Set fixed background state
      setScrolled(window.scrollY > 20);

      // Hide header immediately on scroll
      setIsVisible(false);

      // Clear the previous timeout
      clearTimeout(scrollTimeout);

      // Show header after 200ms of no scrolling
      scrollTimeout = setTimeout(() => {
        setIsVisible(true);
      }, 250);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { name: "Features", href: "/#features" },
    { name: "How It Works", href: "/#how-it-works" },
    { name: "Partners", href: "/#partners" },
  ];

  return (
    <nav className={cn(
      "fixed top-0 z-50 w-full transition-all duration-700 ease-in-out px-4 py-4 sm:px-6 lg:px-8",
      scrolled ? "py-3" : "py-6",
      (!isVisible && scrolled) ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
    )}>
      <div className={cn(
        "max-w-7xl mx-auto rounded-[2rem] transition-all duration-500 border border-transparent",
        (scrolled || isOpen) ? "bg-white shadow-2xl shadow-black/5 border-gray-100/50 px-6" : "px-4"
      )}>
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
              <Zap size={20} className="text-white fill-current" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-gray-900 group-hover:text-blue-600 transition-colors">Zafby</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/login"
              className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 hover:text-blue-600 transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-8 py-3.5 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-black/10 active:scale-95 flex items-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-3 bg-gray-50 text-gray-900 rounded-2xl hover:bg-black hover:text-white transition-all"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-500 ease-in-out",
          isOpen ? "max-h-[400px] opacity-100 py-6" : "max-h-0 opacity-0"
        )}>
          <div className="space-y-4 px-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block text-sm font-black uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-6 flex flex-col gap-4">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-full py-4 text-center text-xs font-black uppercase tracking-widest text-gray-900 bg-gray-50 rounded-2xl"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="w-full py-5 text-center bg-black text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl"
              >
                Start Protection
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
