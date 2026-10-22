"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

type FontSize = "small" | "medium" | "large";

const FONT_SIZE_STORAGE_KEY = "ifta-font-size";
const FONT_SIZE_CHANGE_EVENT = "ifta-font-size-change";

const options: Array<{ value: FontSize; label: string; sampleClassName: string }> = [
  { value: "small", label: "Small", sampleClassName: "text-xs" },
  { value: "medium", label: "Medium", sampleClassName: "text-sm" },
  { value: "large", label: "Large", sampleClassName: "text-base" },
];

function isFontSize(value: unknown): value is FontSize {
  return value === "small" || value === "medium" || value === "large";
}

function getFontSizeSnapshot(): FontSize {
  try {
    const stored = localStorage.getItem(FONT_SIZE_STORAGE_KEY);
    if (isFontSize(stored)) return stored;
  } catch {
    // Keep the default when browser storage is unavailable.
  }

  return "medium";
}

function getServerFontSizeSnapshot(): FontSize {
  return "medium";
}

function subscribeToFontSize(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(FONT_SIZE_CHANGE_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(FONT_SIZE_CHANGE_EVENT, onChange);
  };
}

function applyFontSize(fontSize: FontSize) {
  document.documentElement.dataset.fontSize = fontSize;
  try {
    localStorage.setItem(FONT_SIZE_STORAGE_KEY, fontSize);
  } catch {
    // The current page still receives the selected size if storage is unavailable.
  }
  window.dispatchEvent(new CustomEvent(FONT_SIZE_CHANGE_EVENT));
}

export function FontSizeControl() {
  const selected = useSyncExternalStore(
    subscribeToFontSize,
    getFontSizeSnapshot,
    getServerFontSizeSnapshot,
  );

  return (
    <section aria-labelledby="font-size-heading" className="rounded-xl border border-border bg-background p-4 sm:p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-sm font-bold text-foreground" id="font-size-heading">Font size</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Choose a comfortable text size for your portal.
          </p>
        </div>
        <div aria-label="Choose font size" className="grid grid-cols-3 gap-1 rounded-lg border border-border bg-muted/50 p-1" role="group">
          {options.map((option) => (
            <button
              aria-pressed={selected === option.value}
              className={cn(
                "min-w-20 rounded-md px-3 py-2 font-sans font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                selected === option.value
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
              key={option.value}
              onClick={() => applyFontSize(option.value)}
              type="button"
            >
              <span className={option.sampleClassName}>{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
