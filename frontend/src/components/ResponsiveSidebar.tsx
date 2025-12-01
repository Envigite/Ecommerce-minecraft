"use client";

import { useState, ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

interface ResponsiveSidebarProps {
  title?: string;
  children: ((props: { close: () => void }) => ReactNode) | ReactNode;
  className?: string;
  buttonClassName?: string;
  headerContent?: ReactNode;
}

export function ResponsiveSidebar({
  title,
  children,
  className = "bg-slate-800 border-r border-slate-700",
  buttonClassName = "text-slate-800 hover:bg-slate-100",
  headerContent,
}: ResponsiveSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
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

  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);

  const renderChildren = () => {
    if (typeof children === "function") {
      return children({ close });
    }
    return children;
  };

  const sidebarContent = (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-9998 md:hidden backdrop-blur-sm transition-opacity"
          onClick={close}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-9999 
          flex flex-col p-4
          transition-transform duration-300 ease-in-out
          lg:w-64 w-64 md:w-48
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
          ${className}
        `}
      >
        <div className="mb-6 mt-0.5 md:mt-0">
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          {headerContent}
        </div>

        <div className="flex-1 flex flex-col h-full">{renderChildren()}</div>
      </aside>
    </>
  );

  return (
    <>
      <button
        onClick={toggle}
        className={`z-50 md:hidden p-2 rounded transition-colors ${buttonClassName}`}
        aria-label="Toggle Menu"
      >
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>
      {mounted && createPortal(sidebarContent, document.body)}
    </>
  );
}

function MenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
