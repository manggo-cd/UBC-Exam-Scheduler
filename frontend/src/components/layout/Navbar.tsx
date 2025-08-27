import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Calendar, Search, BookOpen, History, Mail } from "lucide-react";
import { NavLink } from "react-router-dom";

const navigation = [
  { name: "Home", href: "/", icon: Calendar },
  { name: "Search Exams", href: "/search", icon: Search },
  { name: "My Schedule", href: "/schedule", icon: BookOpen },
  { name: "History", href: "/history", icon: History },
  { name: "Contact", href: "/contact", icon: Mail },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gradient-primary shadow-elegant relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-ubc-gold rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-ubc-navy" />
              </div>
              <span className="text-xl font-bold text-white">UBC Exam Scheduler</span>
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-smooth ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:bg-white/10"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-ubc-navy/95 backdrop-blur-sm border-t border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-smooth ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}