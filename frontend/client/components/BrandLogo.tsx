import Logo from "@/assets/logo/logo.png";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  children?: React.ReactNode;
}

export default function BrandLogo({ className, imageClassName, textClassName, children }: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-3 select-none", className)}>
      <img 
        src={Logo} 
        alt="Zafby Logo" 
        className={cn("w-10 h-10 object-contain transition-transform duration-500 group-hover:rotate-6", imageClassName)} 
      />
      <div className="flex items-center gap-2">
        <span className={cn("font-extrabold text-2xl tracking-tighter text-[#1b1c1b]", textClassName)}>
          Zafby<span className="text-[#004191]">.</span>
        </span>
        {children}
      </div>
    </div>
  );
}
