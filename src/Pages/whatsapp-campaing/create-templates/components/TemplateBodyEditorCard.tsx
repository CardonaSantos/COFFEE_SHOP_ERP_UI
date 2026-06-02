"use client";

import { MessageSquareText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  TemplateVariable,
  FormErrors,
} from "@/Types/whatsapp-campaing/types";

interface TemplateBodyEditorCardProps {
  bodyText: string;
  bodyVariables: TemplateVariable[];
  errors: FormErrors;
  onBodyChange: (v: string) => void;
  onVariableChange: (index: number, value: string) => void;
}

export function TemplateBodyEditorCard({
  bodyText,
  bodyVariables,
  errors,
  onBodyChange,
  onVariableChange,
}: TemplateBodyEditorCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <MessageSquareText className="size-4 text-muted-foreground" />
          Cuerpo del mensaje{" "}
          <span className="text-destructive text-xs font-normal">*</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <div className="space-y-1">
          <Textarea
            maxLength={1023}
            value={bodyText}
            onChange={(e) => onBodyChange(e.target.value)}
            placeholder={"Máximo 1023 caracteres"}
            className="text-xs min-h-[88px] resize-none leading-relaxed"
            aria-invalid={!!errors.bodyText}
          />
          {errors.bodyText ? (
            <p className="text-xs text-destructive">{errors.bodyText}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Usa{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
                {"{{1}}"}
              </code>
              ,{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
                {"{{2}}"}
              </code>{" "}
              para variables dinámicas. Meta requiere ejemplos para cada una.
            </p>
          )}
        </div>

        {bodyVariables.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Ejemplos de variables
            </p>
            {errors.bodyVariables && (
              <p className="text-xs text-destructive">{errors.bodyVariables}</p>
            )}
            <div className="grid gap-2 sm:grid-cols-2">
              {bodyVariables.map((v) => (
                <div key={v.index} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Variable{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
                      {`{{${v.index}}}`}
                    </code>
                  </Label>
                  <Input
                    value={v.value}
                    onChange={(e) => onVariableChange(v.index, e.target.value)}
                    placeholder={`Ejemplo para {{${v.index}}}`}
                    className="h-8 text-xs"
                    aria-invalid={!v.value.trim() && !!errors.bodyVariables}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
