"use client"

import { ArrowLeft, RefreshCw, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface TemplateCreateActionsBarProps {
  onBack?: () => void
  onReset: () => void
  onSubmit: () => void
  submitting: boolean
}

export function TemplateCreateActionsBar({
  onBack,
  onReset,
  onSubmit,
  submitting,
}: TemplateCreateActionsBarProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        {onBack && (
          <>
            <Button variant="ghost" size="sm" onClick={onBack} className="h-8 px-2 text-xs gap-1.5">
              <ArrowLeft className="size-3.5" />
              Volver al listado
            </Button>
            <Separator orientation="vertical" className="h-4" />
          </>
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium leading-tight">Nueva plantilla de WhatsApp</span>
          <span className="text-xs text-muted-foreground leading-tight">
            Meta revisará la plantilla antes de aprobarla.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={submitting}
          className="h-8 text-xs gap-1.5"
        >
          <RefreshCw className="size-3.5" />
          Limpiar
        </Button>
        <Button
          size="sm"
          onClick={onSubmit}
          disabled={submitting}
          className="h-8 text-xs gap-1.5"
        >
          <Send className="size-3.5" />
          {submitting ? "Enviando..." : "Enviar a revisión"}
        </Button>
      </div>
    </div>
  )
}
