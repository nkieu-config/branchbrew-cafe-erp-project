"use client"

import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn, disabledState } from "@/lib/utils"
import { formFieldErrorMessageClassName } from "@/lib/theme/color-helpers"

export interface InputProps extends React.ComponentProps<"input"> {
  error?: string
}

function Input({ className, type, error, id, "aria-describedby": ariaDescribedBy, ...props }: InputProps) {
  const errorId = error && id ? `${id}-error` : undefined
  const describedBy = [ariaDescribedBy, errorId].filter(Boolean).join(" ") || undefined

  return (
    <div className="relative w-full">
      <InputPrimitive
        type={type}
        id={id}
        data-slot="input"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
          disabledState,
          "disabled:bg-input/50",
          error
            ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
            : "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
          className
        )}
        {...props}
      />
      {error ? (
        <p id={errorId} className={formFieldErrorMessageClassName()} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export { Input }
