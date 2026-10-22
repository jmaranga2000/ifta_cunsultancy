"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type ThemeMode = "light" | "dark";

const THEME_STORAGE_KEY = "ifta-theme";
const THEME_CHANGE_EVENT = "ifta-theme-change";

function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark";
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;

  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.dataset.theme = theme;
  root.style.colorScheme = theme;

  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function getThemeSnapshot(): ThemeMode {
  try {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemeMode(storedTheme)) {
      return storedTheme;
    }
  } catch {
    // Fall back to the system preference when storage is unavailable.
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function subscribeToTheme(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(THEME_CHANGE_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
  };
}

function getServerThemeSnapshot(): ThemeMode {
  return "light";
}

function setTheme(theme: ThemeMode) {
  applyTheme(theme);
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: theme }));
}

export function ThemeToggle({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "navbar";
}) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  function selectTheme(nextTheme: ThemeMode) {
    setTheme(nextTheme);
  }

  if (variant === "navbar") {
    return (
      <div
        aria-label="Color theme"
        className={cn(
          "inline-flex h-10 items-center rounded-full border border-white/15 bg-white/[0.06] p-1 font-sans",
          className,
        )}
        role="group"
      >
        <button
          aria-label="Use light theme"
          aria-pressed={theme === "light"}
          className={cn(
            "grid h-8 w-8 place-items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold",
            theme === "light" ? "bg-brand-gold text-[#10243b] shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white",
          )}
          onClick={() => selectTheme("light")}
          title="Light theme"
          type="button"
        >
          <Sun aria-hidden="true" className="h-4 w-4" />
        </button>
        <button
          aria-label="Use dark theme"
          aria-pressed={theme === "dark"}
          className={cn(
            "grid h-8 w-8 place-items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold",
            theme === "dark" ? "bg-brand-gold text-[#10243b] shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white",
          )}
          onClick={() => selectTheme("dark")}
          title="Dark theme"
          type="button"
        >
          <Moon aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      aria-pressed={theme === "dark"}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-md border border-border bg-secondary px-2 text-xs font-semibold text-secondary-foreground",
        className,
      )}
      onClick={toggleTheme}
      type="button"
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid h-5 w-5 place-items-center rounded-sm text-[10px] font-bold",
          theme === "dark"
            ? "bg-primary text-primary-foreground"
            : "bg-accent text-accent-foreground",
        )}
      >
        {theme === "dark" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
      </span>
      {theme === "dark" ? "Dark" : "Light"}
    </button>
  );
}
