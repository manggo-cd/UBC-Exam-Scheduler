import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Search, Download, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <div
      className="relative min-h-screen flex items-center"
      style={{
        // nice deep gradient using your tokens
        background:
          "radial-gradient(1200px 600px at 80% 40%, hsl(var(--ubc-gold) / 0.15), transparent 40%), radial-gradient(1000px 500px at 10% 10%, hsl(var(--ubc-blue-light) / 0.20), transparent 35%), linear-gradient(180deg, hsl(var(--ubc-navy)), hsl(var(--ubc-blue)))",
      }}
    >
      {/* Hero */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Text */}
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              Welcome to <br />
              <span className="inline-block mt-1 bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                UBC Exam Scheduler
              </span>
            </h1>

            <p className="mt-5 text-white/80 text-lg leading-relaxed max-w-xl">
              Search official UBC final exams, build your personal list, and export to your
              calendar in one click. Fast, private, and free.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/search">
                <Button className="h-11 px-6 text-base font-semibold">
                  Get Started
                </Button>
              </Link>

              <a
                href="https://github.com/manggo-cd/UBC-Exam-Scheduler"
                target="_blank"
                rel="noreferrer"
                className="text-white/80 hover:text-white underline decoration-white/30 underline-offset-4"
              >
                View on GitHub
              </a>
            </div>

            {/* Quick bullets */}
            <ul className="mt-8 space-y-3 text-white/85">
              <li className="flex items-start gap-3">
                <Search className="w-5 h-5 mt-0.5" />
                <span><strong>Search</strong> by Subject → Course → Section</span>
              </li>
              <li className="flex items-start gap-3">
                <Calendar className="w-5 h-5 mt-0.5" />
                <span><strong>Review</strong> your selected exams in one place</span>
              </li>
              <li className="flex items-start gap-3">
                <Download className="w-5 h-5 mt-0.5" />
                <span><strong>Export</strong> a clean <code>.ics</code> file to any calendar app</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 mt-0.5" />
                <span><strong>UBC Vancouver</strong> focused (historical data coming soon)</span>
              </li>
            </ul>
          </div>

          {/* Simple hero art */}
          <div className="relative">
            <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm shadow-glow p-6 md:p-10">
              <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-white/20 to-white/5">
                <img 
                  src="https://images.unsplash.com/photo-1606761568499-6d2451b23c66?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80"
                  alt="UBC Vancouver Campus with iconic clock tower and buildings"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="mt-4 text-white/75 text-sm">
                Tip: go to <span className="font-semibold">Search Exams</span>, choose your
                course(s), then click <span className="font-semibold">Export ICS</span>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
