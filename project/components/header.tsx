"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/store/user-store";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user } = useUserStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="fixed w-full top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="font-display font-bold text-2xl text-primary">
              MAX<span className="text-accent">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            <Link href="/chat" className="text-foreground hover:text-primary transition-colors">
              Chat
            </Link>
            <Link href="/about" className="text-foreground hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-foreground hover:text-primary transition-colors">
              Contact
            </Link>
            
            {user && (
              <div className="text-sm text-muted-foreground">
                Hello, <span className="font-medium text-foreground">{user.name}</span>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-background border-b border-border"
          >
            <div className="px-4 pt-2 pb-4 space-y-2">
              <Link 
                href="/chat" 
                className="block py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Chat
              </Link>
              <Link 
                href="/about" 
                className="block py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="block py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              
              {user && (
                <div className="py-2 text-sm text-muted-foreground">
                  Hello, <span className="font-medium text-foreground">{user.name}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Toggle theme</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}