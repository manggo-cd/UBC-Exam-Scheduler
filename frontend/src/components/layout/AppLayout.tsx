import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {/* Optional footer:
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} UBC Exam Scheduler
      </footer>
      */}
    </div>
  );
}
