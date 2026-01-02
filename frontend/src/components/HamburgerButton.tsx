"use client";

import { cn } from "@/lib/utils";

interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export const HamburgerButton = ({
  isOpen,
  onClick,
  className,
}: HamburgerButtonProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative z-50 flex h-5 w-7.5 cursor-pointer flex-col justify-between",
        className
      )}
    >
      <span
        className={cn(
          "block h-1 w-full origin-center rounded-full bg-slate-800 transition-all duration-400 ease-in-out",
          isOpen && "translate-y-2 rotate-45"
        )}
      />
      <span
        className={cn(
          "block h-1 w-full rounded-full bg-slate-800 transition-all duration-400 ease-in-out",
          isOpen && "translate-x-4 opacity-0"
        )}
      />
      <span
        className={cn(
          "block h-1 w-full origin-center rounded-full bg-slate-800 transition-all duration-400 ease-in-out",
          isOpen && "-translate-y-2 -rotate-45"
        )}
      />
    </div>
  );
};
