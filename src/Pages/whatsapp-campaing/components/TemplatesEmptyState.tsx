"use client"

import { Button } from "@/components/ui/button"
import { MessageSquarePlus } from "lucide-react"

interface TemplatesEmptyStateProps {
  hasFilters: boolean
  onClear: () => void
}

export function TemplatesEmptyState({ hasFilters, onClear }: TemplatesEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <MessageSquarePlus className="size-10 text-muted-foreground/40" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">
          {hasFilters ? "Sin resultados" : "No hay plantillas"}
        </p>
        <p className="text-xs text-muted-foreground">
          {hasFilters
            ? "Ninguna plantilla coincide con los filtros aplicados."
            : "Aún no tienes plantillas de WhatsApp registradas en Meta."}
        </p>
      </div>
      {hasFilters && (
        <Button variant="outline" size="sm" onClick={onClear}>
          Limpiar filtros
        </Button>
      )}
    </div>
  )
}
