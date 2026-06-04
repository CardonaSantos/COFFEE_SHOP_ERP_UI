"use client";

import { useRef, useState } from "react";
import {
  Upload,
  FileImage,
  // Copy,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WhatsappTemplateMediaHandleResponse } from "@/Types/whatsapp-campaing/types";
import { uploadWhatsappTemplateMediaHandle } from "../services/services";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function truncateHandle(handle: string, chars = 24): string {
  if (handle.length <= chars) return handle;
  return `${handle.slice(0, chars)}…`;
}

interface TemplateMediaUploadFieldProps {
  value?: string;
  previewUrl?: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
  onUploaded: (
    response: WhatsappTemplateMediaHandleResponse,
    previewUrl: string,
  ) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function TemplateMediaUploadField({
  value,
  previewUrl,
  fileName,
  mimeType,
  size,
  onUploaded,
  onRemove,
  disabled = false,
}: TemplateMediaUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  // const [copiedHandle, setCopiedHandle] = useState(false);

  const isUploaded = !!value;

  // ── File selection ────────────────────────────────────────────────────────

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setLocalError("Solo se aceptan imágenes JPEG, PNG o WebP.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setLocalError(
        `La imagen supera el límite de 5 MB (${formatBytes(file.size)}).`,
      );
      e.target.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalFile(file);
    setLocalPreview(objectUrl);
  }

  // ── Upload ────────────────────────────────────────────────────────────────

  async function handleUpload() {
    if (!localFile || !localPreview) return;
    setUploading(true);
    setLocalError(null);
    try {
      const response = await uploadWhatsappTemplateMediaHandle(localFile);
      onUploaded(response, localPreview);
      setLocalFile(null);
      // keep localPreview alive for display; it'll be passed as previewUrl prop
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "Error al subir la imagen.",
      );
    } finally {
      setUploading(false);
    }
  }

  // ── Remove ────────────────────────────────────────────────────────────────

  function handleRemove() {
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
    }
    setLocalFile(null);
    setLocalPreview(null);
    setLocalError(null);
    if (inputRef.current) inputRef.current.value = "";
    onRemove();
  }

  // ── Copy handle ───────────────────────────────────────────────────────────

  // async function handleCopyHandle() {
  //   if (!value) return;
  //   await navigator.clipboard.writeText(value);
  //   // setCopiedHandle(true);
  //   // setTimeout(() => setCopiedHandle(false), 2000);
  // }

  // ── Render ────────────────────────────────────────────────────────────────

  const displayPreview = previewUrl ?? localPreview;

  return (
    <div className="space-y-2">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        aria-hidden="true"
        onChange={handleFileChange}
        disabled={disabled || uploading || isUploaded}
      />

      {/* Upload zone / success state */}
      {isUploaded ? (
        /* ── Uploaded state ── */
        <div className="rounded-md border bg-muted/30 p-3 space-y-2">
          {/* Image preview */}
          {displayPreview && (
            <div className="relative w-full overflow-hidden rounded-md border">
              <img
                src={displayPreview}
                alt={fileName ?? "Header image"}
                className="w-full max-h-40 object-cover"
              />
              <Badge
                variant="default"
                className="absolute top-1.5 left-1.5 text-[10px] h-4 px-1.5 gap-1"
              >
                <CheckCircle2 className="size-2.5" />
                Subida
              </Badge>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px]">
            {fileName && <MetaRow label="Archivo" value={fileName} />}
            {mimeType && <MetaRow label="Tipo" value={mimeType} />}
            {size !== undefined && (
              <MetaRow label="Tamaño" value={formatBytes(size)} />
            )}
            {value && (
              <MetaRow label="Handle" value={truncateHandle(value)} mono />
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 pt-0.5">
            {/* <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1.5"
              onClick={handleCopyHandle}
              disabled={!value}
              aria-label="Copiar handle"
            >
              {copiedHandle ? (
                <CheckCircle2 className="size-3 text-green-600" />
              ) : (
                <Copy className="size-3" />
              )}
              {copiedHandle ? "Copiado" : "Copiar handle"}
            </Button> */}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1.5 text-destructive hover:text-destructive"
              onClick={handleRemove}
              disabled={disabled}
              aria-label="Quitar imagen"
            >
              <Trash2 className="size-3" />
              Quitar
            </Button>
          </div>
        </div>
      ) : localFile ? (
        /* ── File selected, not yet uploaded ── */
        <div className="rounded-md border bg-muted/30 p-3 space-y-2">
          {localPreview && (
            <div className="relative w-full overflow-hidden rounded-md border">
              <img
                src={localPreview}
                alt="Preview local"
                className="w-full max-h-40 object-cover"
              />
              <Badge
                variant="secondary"
                className="absolute top-1.5 left-1.5 text-[10px] h-4 px-1.5"
              >
                Pendiente de subir
              </Badge>
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <FileImage className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="text-xs truncate text-muted-foreground">
                {localFile.name}
              </span>
              <span className="text-[10px] text-muted-foreground shrink-0">
                ({formatBytes(localFile.size)})
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1.5 text-destructive hover:text-destructive"
                onClick={handleRemove}
                disabled={uploading || disabled}
                aria-label="Quitar archivo"
              >
                <Trash2 className="size-3" />
              </Button>
              <Button
                size="sm"
                className="h-7 px-2.5 text-xs gap-1.5"
                onClick={handleUpload}
                disabled={uploading || disabled}
              >
                {uploading ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Upload className="size-3" />
                )}
                {uploading ? "Subiendo…" : "Subir imagen"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* ── Empty / selector ── */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="flex w-full flex-col items-center gap-2 rounded-md border border-dashed bg-muted/20 px-4 py-5 text-center transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          aria-label="Seleccionar imagen"
        >
          <FileImage className="size-7 text-muted-foreground" />
          <div className="space-y-0.5">
            <p className="text-xs font-medium">
              Haz clic para seleccionar una imagen
            </p>
            <p className="text-[10px] text-muted-foreground">
              JPEG, PNG o WebP — máximo 5 MB
            </p>
          </div>
        </button>
      )}

      {/* Validation / upload error */}
      {localError && (
        <Alert variant="destructive" className="py-2 px-3">
          <AlertCircle className="size-3.5" />
          <AlertDescription className="text-xs">{localError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function MetaRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-muted-foreground">{label}:</span>
      <span className={mono ? "font-mono" : ""}>{value}</span>
    </div>
  );
}
