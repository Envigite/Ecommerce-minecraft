"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
//import ChatWidget from "./chat/ChatWidget";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();

  const hideNavigationRoutes = ["/login", "/register", "/admin"];

  const shouldHideNav = hideNavigationRoutes.some((route) =>
    pathname.startsWith(route)
  );

  return (
    <div className="flex flex-col min-h-screen">
      {!shouldHideNav && <Header />}
      {/* {!shouldHideNav && <ChatWidget />} */}

      <main className={`flex-1 ${!shouldHideNav ? "pt-4 pb-10" : ""}`}>
        {children}
      </main>

      {!shouldHideNav && <Footer />}
    </div>
  );
}
