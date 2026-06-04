"use client";

import { Send, AlertCircle, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { WhatsappTemplateCreateFormState } from "@/Types/whatsapp-campaing/types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TemplateSubmitConfirmDialogProps {
  open: boolean;
  form: WhatsappTemplateCreateFormState;
  componentCount: number;
  variableCount: number;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  UTILITY: "Utility",
  MARKETING: "Marketing",
  AUTHENTICATION: "Authentication",
};

const LANGUAGE_LABELS: Record<string, string> = {
  es: "Español",
  es_GT: "Español (Guatemala)",
  en_US: "Inglés (EE.UU.)",
};

export function TemplateSubmitConfirmDialog({
  open,
  form,
  componentCount,
  variableCount,
  submitting,
  onCancel,
  onConfirm,
}: TemplateSubmitConfirmDialogProps) {
  const hasHeaderImage = form.headerEnabled && form.headerFormat === "IMAGE";
  const imageUploaded = hasHeaderImage && !!form.headerHandle.trim();
  const imagePending = hasHeaderImage && !form.headerHandle.trim();
  const confirmDisabled = submitting || imagePending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">
            Enviar plantilla a revisión
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed">
            Meta revisará esta plantilla antes de permitir su uso. Si es
            aprobada, podrás usarla en campañas según su categoría.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border bg-muted/30 p-3 space-y-2 text-xs">
          <SummaryRow label="Nombre">
            <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
              {form.name}
            </code>
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

          {hasHeaderImage && (
            <SummaryRow label="Imagen header">
              {imageUploaded ? (
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                  <CheckCircle2 className="size-3" />
                  Subida
                  {form.headerFileName && (
                    <span className="text-muted-foreground font-normal truncate max-w-[120px]">
                      — {form.headerFileName}
                    </span>
                  )}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                  <AlertCircle className="size-3" />
                  Pendiente
                </span>
              )}
            </SummaryRow>
          )}
        </div>

        {imagePending && (
          <Alert variant="destructive" className="py-2 px-3">
            <AlertCircle className="size-3.5" />
            <AlertDescription className="text-xs">
              Debes subir la imagen a Meta antes de enviar la plantilla a
              revisión.
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter className="gap-2">
          <DialogClose
            onClick={onCancel}
            disabled={submitting}
            className="h-8 text-xs"
          >
            Cancelar
          </DialogClose>
          <Button
            onClick={onConfirm}
            disabled={confirmDisabled}
            className="h-8 text-xs gap-1.5"
          >
            <Send className="size-3.5" />
            {submitting ? "Enviando…" : "Enviar a revisión"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SummaryRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  );
}
