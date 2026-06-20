"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { ExistingImage, UIMedia } from "../interfaces/DomainProdPressTypes";
import { CroppedGrid } from "@/utils/components/Image/croppedGrid";
import ProductImagesCropper from "@/utils/components/Image/ProductImagesCropper";

interface Props {
  files: UIMedia[]; // <- ahora acepta ambos
  onDone: (files: UIMedia[]) => void; // <- devuelve mezcla (Files + Existing)

  onDeleteExisting?: (image: ExistingImage) => Promise<void> | void;
  isDeletingExisting?: boolean;
}

// Type guards
const isFile = (x: UIMedia): x is File => x instanceof File;
const isExisting = (x: UIMedia): x is ExistingImage =>
  !!(x as ExistingImage)?.url && typeof (x as ExistingImage).url === "string";

export function ImageUploader({
  files,
  onDone,
  isDeletingExisting,
  onDeleteExisting,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const existing = (files ?? []).filter(isExisting) as ExistingImage[];
  const fileList = (files ?? []).filter(isFile) as File[];

  const [rawFiles, setRawFiles] = useState<File[]>([]);
  const [openCropper, setOpenCropper] = useState(false);
  const [croppedFiles, setCroppedFiles] = useState<File[]>([]);

  useEffect(() => {
    setCroppedFiles(fileList);
  }, [fileList.map((f) => f.name + f.size + f.type).join("|")]);

  useEffect(() => {
    if (rawFiles.length > 0) setOpenCropper(true);
  }, [rawFiles]);

  const handleChoose = () => fileInputRef.current?.click();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = Array.from(e.target.files ?? []);
    if (!f.length) return;
    setRawFiles(f);
  };

  const handleClear = () => {
    setCroppedFiles([]);
    onDone([]);
    setRawFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDoneCrop = (results: File[]) => {
    setCroppedFiles(results);
    onDone([...existing, ...results]);
    setRawFiles([]);
  };

  const removeExistingAt = async (idx: number) => {
    const image = existing[idx];

    if (!image) return;

    if (image.id) {
      await onDeleteExisting?.(image);
      return;
    }

    const nextExisting = existing.filter((_, i) => i !== idx);
    onDone([...nextExisting, ...croppedFiles]);
  };

  const removeFileAt = (idx: number) => {
    const nextFiles = croppedFiles.filter((_, i) => i !== idx);
    setCroppedFiles(nextFiles);
    onDone([...existing, ...nextFiles]);
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Imágenes</h3>
            <p className="text-xs text-muted-foreground">
              {existing.length + croppedFiles.length
                ? `${existing.length + croppedFiles.length} archivo(s)`
                : "Sin imágenes"}
            </p>
          </div>
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>

      <CardContent className="pt-3 space-y-3">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleInputChange}
          />
          <Button
            variant="outline"
            onClick={handleChoose}
            type="button"
            size="sm"
            className="text-xs"
          >
            <Upload className="h-3 w-3 mr-1" />
            Elegir
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setOpenCropper(true)}
            disabled={!croppedFiles.length}
            className="text-xs"
          >
            Re-cortar
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-xs"
          >
            Limpiar
          </Button>
        </div>

        {existing.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {existing.map((img, idx) => (
              <div
                key={img.id ?? img.url + idx}
                className="relative border rounded overflow-hidden group"
              >
                <img
                  src={img.url}
                  alt={img.name ?? `img-${idx}`}
                  className="w-full h-20 object-cover"
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-background/80 hover:bg-background p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeExistingAt(idx)}
                  disabled={isDeletingExisting}
                  aria-label="Quitar imagen"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <CroppedGrid files={croppedFiles} onRemove={removeFileAt} />
      </CardContent>

      <ProductImagesCropper
        open={openCropper}
        onOpenChange={setOpenCropper}
        files={rawFiles.length ? rawFiles : croppedFiles}
        onDone={handleDoneCrop}
      />
    </Card>
  );
}
