"use client";

import { useEffect, useState } from "react";
import { getChartTheme, type ChartTheme } from "@/lib/theme";

/** Sync Recharts theme when light/dark class toggles on `<html>`. */
export function useChartTheme(): ChartTheme {
  const [theme, setTheme] = useState<ChartTheme>(() => getChartTheme());

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setTheme(getChartTheme());
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return theme;
}
