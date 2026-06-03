import {
  ExternalLink,
  Image as ImageIcon,
  MessageCircle,
  Phone,
  Reply,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type {
  MetaWhatsappTemplate,
  WhatsappTemplateButton,
} from "@/Types/whatsapp-campaing/types";

interface SelectedWhatsappTemplatePreviewProps {
  template: MetaWhatsappTemplate | null;
  headerImageUrl?: string;
}

function getComponent(template: MetaWhatsappTemplate, type: string) {
  return template.components?.find(
    (component) => component.type?.toUpperCase() === type.toUpperCase(),
  );
}

function getHeaderExampleImage(template: MetaWhatsappTemplate): string {
  const header = getComponent(template, "HEADER");
  return header?.example?.header_handle?.[0] ?? "";
}

function renderBodyWithExamples(template: MetaWhatsappTemplate): string {
  const body = getComponent(template, "BODY");
  const bodyText = body?.text ?? "";

  const examples = body?.example?.body_text?.[0] ?? [];

  return bodyText.replace(/\{\{(\d+)\}\}/g, (_match, idx) => {
    const index = Number(idx) - 1;
    return examples[index] ?? `{{${idx}}}`;
  });
}

function ButtonIcon({ type }: { type: WhatsappTemplateButton["type"] }) {
  if (type === "URL") return <ExternalLink className="size-3" />;
  if (type === "PHONE_NUMBER") return <Phone className="size-3" />;
  return <Reply className="size-3" />;
}

export function SelectedWhatsappTemplatePreview({
  template,
  headerImageUrl,
}: SelectedWhatsappTemplatePreviewProps) {
  if (!template) {
    return (
      <Card>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="flex items-center gap-1.5 text-xs font-semibold">
            <MessageCircle className="size-4 text-muted-foreground" />
            Preview de plantilla
          </CardTitle>
        </CardHeader>

        <CardContent className="p-3 pt-0">
          <div className="rounded-xl border bg-muted/30 p-3">
            <div className="flex h-24 items-center justify-center">
              <p className="text-xs text-muted-foreground">
                Selecciona una plantilla para ver el preview.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const header = getComponent(template, "HEADER");
  const footer = getComponent(template, "FOOTER");
  const buttonsComponent = getComponent(template, "BUTTONS");

  const headerFormat = header?.format;
  const isImageHeader = headerFormat === "IMAGE";
  const isTextHeader = headerFormat === "TEXT";

  const previewImageUrl =
    headerImageUrl?.trim() || getHeaderExampleImage(template);

  const renderedBody = renderBodyWithExamples(template);

  const buttons = buttonsComponent?.buttons ?? [];

  return (
    <Card>
      <CardHeader className="p-3 pb-2">
        <CardTitle className="flex items-center gap-1.5 text-xs font-semibold">
          <MessageCircle className="size-4 text-muted-foreground" />
          Preview de plantilla
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-2">
        <div className="flex flex-wrap items-center gap-1">
          <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
            {template.name}
          </Badge>
          <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
            {template.category}
          </Badge>
          <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
            {template.language}
          </Badge>
        </div>

        <div className="rounded-xl border bg-muted/30 p-3">
          <div className="flex flex-col items-end">
            <div className="w-full max-w-[280px] overflow-hidden rounded-xl rounded-tr-sm border bg-card shadow-sm">
              {isImageHeader && (
                <>
                  {previewImageUrl ? (
                    <div className="relative">
                      <img
                        src={previewImageUrl}
                        alt="Header"
                        className="max-h-36 w-full object-cover"
                      />

                      <Badge
                        variant={
                          headerImageUrl?.trim() ? "default" : "secondary"
                        }
                        className="absolute bottom-1.5 left-1.5 h-4 px-1.5 text-[10px]"
                      >
                        {headerImageUrl?.trim()
                          ? "Imagen de campaña"
                          : "Imagen de ejemplo"}
                      </Badge>
                    </div>
                  ) : (
                    <div className="flex h-20 items-center justify-center gap-1.5 bg-muted/50">
                      <ImageIcon className="size-5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Header IMAGE requerido
                      </span>
                    </div>
                  )}
                </>
              )}

              {isTextHeader && header?.text && (
                <div className="px-2.5 pt-2.5">
                  <p className="text-xs font-semibold leading-snug">
                    {header.text}
                  </p>
                </div>
              )}

              <div className="px-2.5 py-2">
                {renderedBody ? (
                  <p className="whitespace-pre-wrap text-xs leading-relaxed text-foreground">
                    {renderedBody}
                  </p>
                ) : (
                  <p className="text-xs italic text-muted-foreground">
                    Sin cuerpo de mensaje.
                  </p>
                )}
              </div>

              {footer?.text && (
                <div className="px-2.5 pb-2">
                  <p className="text-[10px] leading-snug text-muted-foreground">
                    {footer.text}
                  </p>
                </div>
              )}

              <div className="flex justify-end px-2.5 pb-1.5">
                <span className="text-[10px] text-muted-foreground">
                  {new Date().toLocaleTimeString("es", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            {buttons.length > 0 && (
              <div className="mt-1 w-full max-w-[280px] space-y-1">
                {buttons.map((button, index) => (
                  <div
                    key={`${button.type}-${button.text}-${index}`}
                    className="flex items-center justify-center gap-1.5 rounded-lg border bg-card px-2.5 py-1.5 shadow-sm"
                  >
                    <ButtonIcon type={button.type} />
                    <span className="truncate text-xs font-medium text-primary">
                      {button.text || "Sin texto"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {isImageHeader && !headerImageUrl?.trim() && (
          <p className="text-[11px] leading-relaxed text-amber-600">
            Esta vista usa la imagen de ejemplo de Meta. Para enviar la campaña,
            ingresa una URL pública de imagen.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
