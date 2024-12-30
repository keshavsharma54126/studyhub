import { type JSX } from "react";
import { cn } from "../utils/cn";

interface CardProps {
  className?: string;
  title: string;
  children: React.ReactNode;
  href: string;
  gradient?: boolean;
  hoverEffect?: boolean;
  icon?: React.ReactNode;
}

export function Card({
  className,
  title,
  children,
  href,
  gradient = false,
  hoverEffect = true,
  icon,
}: CardProps): JSX.Element {
  return (
    <a
      className={cn(
        // Base styles
        "block p-6 rounded-2xl transition-all duration-300",
        "border border-gray-800 backdrop-blur-sm",
        
        // Dark mode optimization
        "bg-black/60 dark:bg-black/40",
        
        // Hover effects
        hoverEffect && [
          "hover:shadow-xl hover:shadow-teal-500/10",
          "hover:border-teal-500/50",
          "transform hover:-translate-y-1",
        ],
        
        // Gradient variant
        gradient && [
          "bg-gradient-to-br from-teal-500/10 via-black/60 to-cyan-500/10",
          "hover:from-teal-500/20 hover:to-cyan-500/20",
        ],
        
        className
      )}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <div className="flex items-start gap-4">
        {icon && (
          <div className="flex-shrink-0 p-2 rounded-xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10">
            {icon}
          </div>
        )}
        
        <div className="flex-1 space-y-3">
          <h2 className="flex items-center justify-between font-medium">
            <span className="text-gray-100 group-hover:text-teal-500 transition-colors">
              {title}
            </span>
            <svg
              className="w-5 h-5 text-gray-400 group-hover:text-teal-500 transition-colors"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </h2>
          
          <p className="text-sm text-gray-400 leading-relaxed">
            {children}
          </p>
        </div>
      </div>
    </a>
  );
}
