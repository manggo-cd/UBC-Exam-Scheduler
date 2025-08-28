import React from "react";

/**
 * HistoryPage
 * - Placeholder for Past Semesters (Coming Soon)
 * - Safe to ship: no calls to unimplemented APIs
 * - Default export so App.tsx can `import HistoryPage from "./pages/HistoryPage"`
 */
export default function HistoryPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">History</h1>

      {/* Past Semesters — Coming Soon */}
      <section className="rounded-xl border p-4 md:p-6 bg-white/60">
        <h2 className="text-lg font-semibold mb-1">Past Semesters</h2>
        <p className="text-sm text-gray-600 mb-3">
          We’re finalizing historical exam data with the UBC Registrar. You’ll be able
          to search past years/terms here soon.
        </p>

        <ul className="list-disc pl-5 text-sm text-gray-700">
          <li>
            Search by <strong>Year</strong>, <strong>Term</strong> (e.g., 2023–2024, Winter Term 1)
          </li>
          <li>
            Filter by <strong>Subject → Course → Section</strong>
          </li>
          <li>
            Export matching results to <strong>.ics</strong>
          </li>
        </ul>

        <div className="mt-4 flex gap-2">
          <button
            disabled
            className="px-3 py-2 rounded-lg bg-gray-200 text-gray-500 cursor-not-allowed"
            aria-disabled="true"
            title="Coming Soon"
          >
            Coming Soon
          </button>
        </div>
      </section>
    </main>
  );
}
