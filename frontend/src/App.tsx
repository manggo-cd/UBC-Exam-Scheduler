import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "@/components/layout/AppLayout";

import SearchPage from "./pages/SearchPage";
import SchedulePage from "./pages/SchedulePage";
import HistoryPage from "./pages/HistoryPage";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";

import { ScheduleProvider } from "./contexts/ScheduleContext";

export default function App() {
  return (
    <ScheduleProvider>
      <BrowserRouter>
        <Routes>
          {/* Everything below uses the shared layout (Navbar persists) */}
          <Route element={<AppLayout />}>
            <Route index element={<SearchPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="home" element={<Navigate to="/search" replace />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ScheduleProvider>
  );
}
