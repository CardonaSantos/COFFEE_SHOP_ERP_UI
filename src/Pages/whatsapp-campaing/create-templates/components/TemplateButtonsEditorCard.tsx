"use client";

import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  WhatsappTemplateButton,
  WhatsappTemplateButtonType,
  FormErrors,
} from "@/Types/whatsapp-campaing/types";

const BUTTON_TYPES: { value: WhatsappTemplateButtonType; label: string }[] = [
  { value: "QUICK_REPLY", label: "Respuesta rápida" },
  { value: "URL", label: "URL" },
  { value: "PHONE_NUMBER", label: "Teléfono" },
];

interface TemplateButtonsEditorCardProps {
  buttonsEnabled: boolean;
  buttons: WhatsappTemplateButton[];
  errors: FormErrors;
  onToggle: (v: boolean) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onTypeChange: (index: number, type: WhatsappTemplateButtonType) => void;
  onUpdate: (index: number, patch: Partial<WhatsappTemplateButton>) => void;
}

export function TemplateButtonsEditorCard({
  buttonsEnabled,
  buttons,
  errors,
  onToggle,
  onAdd,
  onRemove,
  onTypeChange,
  onUpdate,
}: TemplateButtonsEditorCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Plus className="size-4 text-muted-foreground" />
            Botones{" "}
            <span className="text-xs text-muted-foreground font-normal">
              (opcional, máx. 3)
            </span>
          </CardTitle>
          <Switch
            checked={buttonsEnabled}
            onCheckedChange={onToggle}
            aria-label="Activar botones"
          />
        </div>
      </CardHeader>

      {buttonsEnabled && (
        <CardContent className="px-4 pb-4 space-y-3">
          {buttons.map((btn, i) => (
            <div key={i} className="space-y-2">
              {i > 0 && <Separator />}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Botón {i + 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemove(i)}
                  aria-label={`Eliminar botón ${i + 1}`}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {/* Type */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Tipo</Label>
                  <Select
                    value={btn.type}
                    onValueChange={(v) =>
                      onTypeChange(i, v as WhatsappTemplateButtonType)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BUTTON_TYPES.map((t) => (
                        <SelectItem
                          key={t.value}
                          value={t.value}
                          className="text-xs"
                        >
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Text */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium">
                    Texto <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={btn.text}
                    onChange={(e) => onUpdate(i, { text: e.target.value })}
                    placeholder="Ej: Confirmar | Máximo 40 caracteres"
                    className="h-8 text-xs"
                    aria-invalid={!!errors[`button_${i}_text`]}
                  />
                  {errors[`button_${i}_text`] && (
                    <p className="text-xs text-destructive">
                      {errors[`button_${i}_text`]}
                    </p>
                  )}
                </div>
              </div>

              {/* URL field */}
              {btn.type === "URL" && (
                <div className="space-y-1">
                  <Label className="text-xs font-medium">
                    URL <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={btn.url ?? ""}
                    onChange={(e) => onUpdate(i, { url: e.target.value })}
                    placeholder="https://... | Máximo 2000 caracteres"
                    className="h-8 text-xs"
                    aria-invalid={!!errors[`button_${i}_url`]}
                  />
                  {errors[`button_${i}_url`] && (
                    <p className="text-xs text-destructive">
                      {errors[`button_${i}_url`]}
                    </p>
                  )}
                </div>
              )}

              {/* Phone field */}
              {btn.type === "PHONE_NUMBER" && (
                <div className="space-y-1">
                  <Label className="text-xs font-medium">
                    Teléfono <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={btn.phone_number ?? ""}
                    onChange={(e) =>
                      onUpdate(i, { phone_number: e.target.value })
                    }
                    placeholder="+502..."
                    className="h-8 text-xs"
                    aria-invalid={!!errors[`button_${i}_phone`]}
                  />
                  {errors[`button_${i}_phone`] && (
                    <p className="text-xs text-destructive">
                      {errors[`button_${i}_phone`]}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}

          {buttons.length < 3 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAdd}
              className="h-8 w-full text-xs gap-1.5 border-dashed"
            >
              <Plus className="size-3.5" />
              Agregar botón
            </Button>
          )}

          {buttons.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-1">
              Agrega hasta 3 botones de acción.
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}
