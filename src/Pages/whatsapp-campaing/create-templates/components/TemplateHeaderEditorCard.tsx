"use client";

import { Image } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TemplateMediaUploadField } from "./TemplateMediaUploadField";
import type {
  WhatsappTemplateHeaderFormat,
  FormErrors,
  WhatsappTemplateMediaHandleResponse,
} from "@/Types/whatsapp-campaing/types";

const HEADER_FORMATS: { value: WhatsappTemplateHeaderFormat; label: string }[] =
  [
    { value: "TEXT", label: "Texto" },
    { value: "IMAGE", label: "Imagen" },
    // { value: "VIDEO", label: "Video" },
    // { value: "DOCUMENT", label: "Documento" },
  ];

interface TemplateHeaderEditorCardProps {
  headerEnabled: boolean;
  headerFormat: WhatsappTemplateHeaderFormat;
  headerText: string;
  headerHandle: string;
  headerFileName?: string;
  headerMimeType?: string;
  headerFileSize?: number;
  headerPreviewUrl?: string;
  errors: FormErrors;
  onToggle: (v: boolean) => void;
  onFormatChange: (v: WhatsappTemplateHeaderFormat) => void;
  onTextChange: (v: string) => void;
  onHandleChange: (v: string) => void;
  onImageUploaded: (
    response: WhatsappTemplateMediaHandleResponse,
    previewUrl: string,
  ) => void;
  onImageRemoved: () => void;
}

export function TemplateHeaderEditorCard({
  headerEnabled,
  headerFormat,
  headerText,
  headerHandle,
  headerFileName,
  headerMimeType,
  headerFileSize,
  headerPreviewUrl,
  errors,
  onToggle,
  onFormatChange,
  onTextChange,
  onHandleChange,
  onImageUploaded,
  onImageRemoved,
}: TemplateHeaderEditorCardProps) {
  const isManualHandle =
    headerFormat === "VIDEO" || headerFormat === "DOCUMENT";

  return (
    <Card>
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Image className="size-4 text-muted-foreground" />
            Header{" "}
            <span className="text-xs text-muted-foreground font-normal">
              (opcional)
            </span>
          </CardTitle>
          <Switch
            checked={headerEnabled}
            onCheckedChange={onToggle}
            aria-label="Activar header"
          />
        </div>
      </CardHeader>

      {headerEnabled && (
        <CardContent className="px-4 pb-4 space-y-3">
          {/* Format selector */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">Formato</Label>
            <Select
              value={headerFormat}
              onValueChange={(v) =>
                onFormatChange(v as WhatsappTemplateHeaderFormat)
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HEADER_FORMATS.map((f) => (
                  <SelectItem key={f.value} value={f.value} className="text-xs">
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* TEXT: simple input */}
          {headerFormat === "TEXT" && (
            <div className="space-y-1">
              <Label className="text-xs font-medium">
                Texto del header <span className="text-destructive">*</span>
              </Label>
              <Input
                maxLength={59}
                value={headerText}
                onChange={(e) => onTextChange(e.target.value)}
                placeholder="Ej: Aviso de pago | Máximo 59 caracteres"
                className="h-8 text-xs"
                aria-invalid={!!errors.headerText}
              />
              {errors.headerText && (
                <p className="text-xs text-destructive">{errors.headerText}</p>
              )}
            </div>
          )}

          {/* IMAGE: media upload field */}
          {headerFormat === "IMAGE" && (
            <div className="space-y-1">
              <Label className="text-xs font-medium">
                Imagen del header <span className="text-destructive">*</span>
              </Label>
              <TemplateMediaUploadField
                value={headerHandle}
                previewUrl={headerPreviewUrl}
                fileName={headerFileName}
                mimeType={headerMimeType}
                size={headerFileSize}
                onUploaded={onImageUploaded}
                onRemove={onImageRemoved}
              />
              {errors.headerHandle && (
                <p className="text-xs text-destructive">
                  {errors.headerHandle}
                </p>
              )}
            </div>
          )}

          {/* VIDEO / DOCUMENT: manual handle input */}
          {isManualHandle && (
            <div className="space-y-1">
              <Label className="text-xs font-medium">
                Media handle <span className="text-destructive">*</span>
              </Label>
              <Input
                value={headerHandle}
                onChange={(e) => onHandleChange(e.target.value)}
                placeholder="4::…"
                className="h-8 text-xs font-mono"
                aria-invalid={!!errors.headerHandle}
              />
              {errors.headerHandle ? (
                <p className="text-xs text-destructive">
                  {errors.headerHandle}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Sube el archivo manualmente y pega el handle devuelto por
                  Meta.
                </p>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
