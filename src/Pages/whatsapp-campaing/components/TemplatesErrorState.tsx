"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface TemplatesErrorStateProps {
  message: string
  onRetry: () => void
}

export function TemplatesErrorState({ message, onRetry }: TemplatesErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <AlertCircle className="size-9 text-destructive/60" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Error al cargar</p>
        <p className="text-xs text-muted-foreground max-w-xs">{message}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  )
}
