import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Shared focus ring — uses semantic --focus-ring token. */
export const focusRing = cn(
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]/50",
  "motion-reduce:transition-none",
)

/** Shared disabled interaction state. */
export const disabledState = cn(
  "disabled:pointer-events-none disabled:opacity-50",
  "disabled:cursor-not-allowed",
)

