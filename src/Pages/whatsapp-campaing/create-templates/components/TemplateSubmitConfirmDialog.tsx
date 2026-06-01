"use client"

import { Send } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import type { WhatsappTemplateCreateFormState } from "@/Types/whatsapp-campaing/types"

interface TemplateSubmitConfirmDialogProps {
  open: boolean
  form: WhatsappTemplateCreateFormState
  componentCount: number
  variableCount: number
  submitting: boolean
  onCancel: () => void
  onConfirm: () => void
}

const CATEGORY_LABELS: Record<string, string> = {
  UTILITY: "Utility",
  MARKETING: "Marketing",
  AUTHENTICATION: "Authentication",
}

const LANGUAGE_LABELS: Record<string, string> = {
  es: "Español",
  es_GT: "Español (Guatemala)",
  en_US: "Inglés (EE.UU.)",
}

export function TemplateSubmitConfirmDialog({
  open,
  form,
  componentCount,
  variableCount,
  submitting,
  onCancel,
  onConfirm,
}: TemplateSubmitConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-sm font-semibold">
            Enviar plantilla a revisión
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs leading-relaxed">
            Meta revisará esta plantilla antes de permitir su uso. Si es aprobada, podrás
            usarla en campañas o mensajes según su categoría.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Summary */}
        <div className="rounded-md border bg-muted/30 p-3 space-y-2 text-xs">
          <SummaryRow label="Nombre">
            <code className="rounded bg-muted px-1 py-0.5 text-[10px]">{form.name}</code>
          </SummaryRow>
          <SummaryRow label="Categoría">
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
              {CATEGORY_LABELS[form.category] ?? form.category}
            </Badge>
          </SummaryRow>
          <SummaryRow label="Idioma">
            {LANGUAGE_LABELS[form.language] ?? form.language}
          </SummaryRow>
          <SummaryRow label="Componentes">
            {componentCount} sección{componentCount !== 1 ? "es" : ""}
          </SummaryRow>
          <SummaryRow label="Variables en body">
            {variableCount === 0 ? "Ninguna" : variableCount}
          </SummaryRow>
        </div>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel
            onClick={onCancel}
            disabled={submitting}
            className="h-8 text-xs"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={submitting}
            className="h-8 text-xs gap-1.5"
          >
            <Send className="size-3.5" />
            {submitting ? "Enviando..." : "Enviar a revisión"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function SummaryRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  )
}
