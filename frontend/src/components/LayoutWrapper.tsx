"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();

  const hideHeaderRoutes = ["/login", "/register", "/admin"];
  const shouldHideHeader = hideHeaderRoutes.some((route) =>
    pathname.startsWith(route)
  );

  return (
    <>
      {!shouldHideHeader && <Header />}
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </>
  );
}
