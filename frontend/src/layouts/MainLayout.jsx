"use client";

import { Suspense } from "react";
import Navbar from "@/views/sharedPages/Navbar";
import Footer from "@/views/sharedPages/Footer";
import FloatingButtons from "@/components/ui/FloatingButtons";
import StickyCardDrawer from "@/components/shared/StickyCardDrawer";

export default function MainLayout({ children }) {
  return (
    <>
      <div>

        <Navbar />

        <main className="flex-1">
          {children}
        </main>

        <Footer />
      </div>

      <FloatingButtons />
      <StickyCardDrawer />
    </>
  );
}
