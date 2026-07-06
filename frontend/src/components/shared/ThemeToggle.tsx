"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { themePrimitives } from "@/lib/theme/primitives";
import { topbarActionButtonClassName } from "@/lib/theme/shell";
import { cn } from "@/lib/utils";

type ThemePreference = "light" | "dark";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Migrate legacy "system" preference from localStorage to an explicit choice.
  useEffect(() => {
    if (!mounted || theme !== "system") return;
    setTheme(resolvedTheme === "dark" ? "dark" : "light");
  }, [mounted, resolvedTheme, setTheme, theme]);

  // SSR and the first client paint must match defaultTheme="light" in layout.tsx.
  const isDark = mounted && resolvedTheme === "dark";

  useEffect(() => {
    if (!mounted) return;

    const metaColor = isDark
      ? themePrimitives.dark.background
      : themePrimitives.light.background;
    let meta = document.querySelector('meta[name="theme-color"]');

    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }

    meta.setAttribute("content", metaColor);
  }, [isDark, mounted]);

  const nextTheme: ThemePreference = isDark ? "light" : "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";
  const Icon = isDark ? Sun : Moon;

  if (!mounted) {
    return (
      <button
        type="button"
        className={cn(topbarActionButtonClassName(), "relative", className)}
        aria-label="Theme"
        title="Theme"
        disabled
      >
        <span className="sr-only">Theme</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={cn(topbarActionButtonClassName(), "relative", className)}
      onClick={() => setTheme(nextTheme)}
      aria-label={label}
      title={label}
    >
      <Icon className="h-4 w-4" aria-hidden />
      <span className="sr-only">{label}</span>
    </button>
  );
}
