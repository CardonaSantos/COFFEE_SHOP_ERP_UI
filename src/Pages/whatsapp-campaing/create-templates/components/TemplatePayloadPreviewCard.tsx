"use client";

import { useState } from "react";
import { Copy, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import type { CreateWhatsappTemplateDto } from "@/Types/whatsapp-campaing/types";

interface TemplatePayloadPreviewCardProps {
  payload: CreateWhatsappTemplateDto | null;
  submitResult: { id: string; status: string; category?: string } | null;
  submitError: string | null;
}

export function TemplatePayloadPreviewCard({
  payload,
  submitResult,
  submitError,
}: TemplatePayloadPreviewCardProps) {
  const [copied, setCopied] = useState(false);

  const json = payload ? JSON.stringify(payload, null, 2) : null;

  const handleCopy = async () => {
    if (!json) return;
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      {/* Submit result */}
      {submitResult && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
          <CheckCircle2 className="size-3.5 text-green-600" />
          <AlertDescription className="text-xs text-green-700 dark:text-green-400">
            <span className="font-medium">
              Plantilla enviada a revisión correctamente.
            </span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <span className="text-muted-foreground">ID:</span>
              <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
                {submitResult.id}
              </code>
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                {submitResult.status}
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Submit error */}
      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="size-3.5" />
          <AlertDescription className="text-xs">{submitError}</AlertDescription>
        </Alert>
      )}

      {/* Payload preview */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Preview payload
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={handleCopy}
              disabled={!json}
              aria-label="Copiar payload"
            >
              {copied ? (
                <CheckCircle2 className="size-3.5 text-green-600" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {json ? (
            <ScrollArea className="max-h-[280px] rounded-md border bg-muted/40 p-3">
              <pre className="text-[10px] leading-relaxed text-foreground/80 whitespace-pre-wrap break-words font-mono">
                {json}
              </pre>
            </ScrollArea>
          ) : (
            <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-4">
              <AlertCircle className="size-3.5 text-muted-foreground shrink-0" />
              <p className="text-xs text-muted-foreground">
                Completa el formulario para ver el payload que se enviará a
                Meta.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
