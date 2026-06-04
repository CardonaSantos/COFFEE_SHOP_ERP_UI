"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function TemplatesLoadingSkeleton() {
  return (
    <div className="space-y-2 p-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-full rounded-md" />
      ))}
    </div>
  )
}
