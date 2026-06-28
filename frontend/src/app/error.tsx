"use client" // Error boundaries must be Client Components

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { hubPrimaryActionClassName, statusToneClassName, text, typeHeadingClassName } from "@/lib/theme"
import { cn } from "@/lib/utils"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global Error Caught:", error)
  }, [error])

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center space-y-4 text-center">
      <div className={cn("p-4 rounded-full", statusToneClassName("danger"))}>
        <AlertCircle className="w-12 h-12" />
      </div>
      <h2 className={typeHeadingClassName("text-2xl tracking-tight")}>Something went wrong!</h2>
      <p className={cn("max-w-md", text.muted)}>
        We apologize for the inconvenience. An unexpected error occurred while rendering this page.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} className={hubPrimaryActionClassName()}>
          Try again
        </Button>
        <Button variant="outline" onClick={() => window.location.href = '/'}>
          Return to Dashboard
        </Button>
      </div>
    </div>
  )
}
