"use client";

import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FormErrors } from "@/Types/whatsapp-campaing/types";

const LANGUAGES = [
  { value: "es", label: "Español (es)" },
  // { value: "es_GT", label: "Español Guatemala (es_GT)" },
  // { value: "en_US", label: "Inglés EE.UU. (en_US)" },
];

interface TemplateBasicInfoCardProps {
  name: string;
  language: string;
  errors: FormErrors;
  onNameChange: (v: string) => void;
  onLanguageChange: (v: string) => void;
}

export function TemplateBasicInfoCard({
  name,
  language,
  errors,
  onNameChange,
  onLanguageChange,
}: TemplateBasicInfoCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <FileText className="size-4 text-muted-foreground" />
          Información básica
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        {/* Name */}
        <div className="space-y-1">
          <Label htmlFor="tpl-name" className="text-xs font-medium">
            Nombre técnico <span className="text-destructive">*</span>
          </Label>
          <Input
            id="tpl-name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="recordatorio_pago_servicio | Máximo 511 caracteres"
            className="h-8 text-xs font-mono"
            aria-invalid={!!errors.name}
            maxLength={511}
          />
          {errors.name ? (
            <p className="text-xs text-destructive">{errors.name}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Meta requiere nombres en minúsculas, sin espacios. Usa guion bajo.
            </p>
          )}
        </div>

        {/* Language */}
        <div className="space-y-1">
          <Label htmlFor="tpl-lang" className="text-xs font-medium">
            Idioma <span className="text-destructive">*</span>
          </Label>
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger id="tpl-lang" className="h-8 text-xs">
              <SelectValue placeholder="Selecciona idioma" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l.value} value={l.value} className="text-xs">
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.language && (
            <p className="text-xs text-destructive">{errors.language}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
