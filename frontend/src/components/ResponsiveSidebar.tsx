"use client";

import { ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ((props: { close: () => void }) => ReactNode) | ReactNode;
  className?: string;
  headerContent?: ReactNode;
}

export function ResponsiveSidebar({
  isOpen,
  onClose,
  title,
  children,
  className = "bg-white border-r border-slate-200",
  headerContent,
}: ResponsiveSidebarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const renderChildren = () => {
    if (typeof children === "function") {
      return children({ close: onClose });
    }
    return children;
  };

  if (!mounted) return null;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-54 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        style={{ top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <aside
        className={cn(
          `fixed inset-y-0 left-0 z-55 
           flex flex-col p-4 pt-20
           transition-transform duration-300 ease-in-out
           w-[85vw] max-w-sm md:hidden`,
          className,
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-6 mt-0.5">
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          {headerContent}
        </div>

        <div className="flex-1 flex flex-col h-full overflow-y-auto">
          {renderChildren()}
        </div>
      </aside>
    </>
  );
}
