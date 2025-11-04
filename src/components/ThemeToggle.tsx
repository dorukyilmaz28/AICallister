"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 bg-white/20 border border-white/30 text-white">
        <div className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 bg-white/20 hover:bg-white/30 border border-white/30 text-white dark:bg-white/20 dark:hover:bg-white/30 dark:border-white/30 dark:text-white"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <>
          <Sun className="w-4 h-4" />
          <span className="hidden md:inline">Açık</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4" />
          <span className="hidden md:inline">Koyu</span>
        </>
      )}
    </button>
  );
}

