"use client" // Error boundaries must be Client Components

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Caught:", error)
  }, [error])

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center space-y-4 text-center">
      <div className="bg-red-100 text-red-600 p-4 rounded-full">
        <AlertCircle className="w-12 h-12" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
      <p className="text-slate-500 max-w-md">
        We apologize for the inconvenience. An unexpected error occurred while rendering this page.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          Try again
        </Button>
        <Button variant="outline" onClick={() => window.location.href = '/'}>
          Return to Dashboard
        </Button>
      </div>
    </div>
  )
}
