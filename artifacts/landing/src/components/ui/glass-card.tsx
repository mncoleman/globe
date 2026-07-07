import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-black/5 dark:bg-white/5 backdrop-blur-[20px] border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-sm overflow-hidden",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
