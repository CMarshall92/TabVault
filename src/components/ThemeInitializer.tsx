"use client";

import { useTheme } from "@/hooks/useTheme";

/**
 * A null-render component that simply initializes the theme
 * by invoking the useTheme hook (which contains the useEffect).
 */
export default function ThemeInitializer() {
  useTheme();
  return null;
}
