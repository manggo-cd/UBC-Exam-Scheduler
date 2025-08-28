import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import SearchPage from "./pages/SearchPage";
import SchedulePage from "./pages/SchedulePage";
import HistoryPage from "./pages/HistoryPage";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";

// ⬅️ ADD THIS
import { ScheduleProvider } from "./contexts/ScheduleContext"; // or "@/contexts/ScheduleContext" if you prefer the alias

export default function App() {
  return (
    <ScheduleProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ScheduleProvider>
  );
}