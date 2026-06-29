"use client";

import { useEffect, useState } from "react";
import { getChartTheme } from "@/lib/theme/chart-styles";
import type { ChartTheme } from "@/lib/theme/chart-styles";

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
