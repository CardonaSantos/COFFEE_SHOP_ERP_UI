"use client";

import {
  MessageCircle,
  ExternalLink,
  Phone,
  Reply,
  Image as ImageIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type {
  WhatsappTemplateCreateFormState,
  TemplateVariable,
  WhatsappTemplateButton,
} from "@/Types/whatsapp-campaing/types";

function renderBodyWithExamples(
  bodyText: string,
  variables: TemplateVariable[],
): string {
  if (!bodyText) return "";
  return bodyText.replace(/\{\{(\d+)\}\}/g, (_match, idx) => {
    const variable = variables.find((v) => v.index === Number(idx));
    const example = variable?.value?.trim();
    return example ? example : `{{${idx}}}`;
  });
}

function ButtonIcon({ type }: { type: WhatsappTemplateButton["type"] }) {
  if (type === "URL") return <ExternalLink className="size-3" />;
  if (type === "PHONE_NUMBER") return <Phone className="size-3" />;
  return <Reply className="size-3" />;
}

interface TemplateWhatsappPreviewCardProps {
  form: WhatsappTemplateCreateFormState;
}

export function TemplateWhatsappPreviewCard({
  form,
}: TemplateWhatsappPreviewCardProps) {
  const {
    headerEnabled,
    headerFormat,
    headerText,
    headerPreviewUrl,
    headerHandle,
    bodyText,
    bodyVariables,
    footerEnabled,
    footerText,
    buttonsEnabled,
    buttons,
  } = form;

  const renderedBody = renderBodyWithExamples(bodyText, bodyVariables);

  const hasContent =
    bodyText.trim() ||
    (headerEnabled && (headerText.trim() || headerPreviewUrl)) ||
    (footerEnabled && footerText.trim()) ||
    (buttonsEnabled && buttons.length > 0);

  const hasHeaderImage = headerEnabled && headerFormat === "IMAGE";
  const imageUploaded = hasHeaderImage && !!headerHandle;
  const imagePending = hasHeaderImage && !headerHandle && !!headerPreviewUrl;

  return (
    <Card>
      <CardHeader className="p-3 pb-2">
        <CardTitle className="flex items-center gap-1.5 text-sm font-medium">
          <MessageCircle className="size-4 text-muted-foreground" />
          Preview en WhatsApp
        </CardTitle>
        <CardDescription className="text-xs">
          Vista aproximada del mensaje recibido.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-3 pt-0">
        {/* Phone shell */}
        <div className="rounded-xl border bg-muted/30 p-3">
          {/* Chat background */}
          <div className="min-h-[80px] space-y-2">
            {hasContent ? (
              <div className="flex flex-col items-end">
                {/* Message bubble */}
                <div className="w-full max-w-[280px] rounded-xl rounded-tr-sm border bg-card shadow-sm overflow-hidden">
                  {/* Header: image */}
                  {headerEnabled && headerFormat === "IMAGE" && (
                    <>
                      {headerPreviewUrl ? (
                        <div className="relative">
                          <img
                            src={headerPreviewUrl}
                            alt="Header"
                            className="w-full max-h-36 object-cover"
                          />
                          {imagePending && (
                            <Badge
                              variant="secondary"
                              className="absolute bottom-1.5 left-1.5 text-[10px] h-4 px-1.5"
                            >
                              Pendiente de subir
                            </Badge>
                          )}
                          {imageUploaded && (
                            <Badge
                              variant="default"
                              className="absolute bottom-1.5 left-1.5 text-[10px] h-4 px-1.5"
                            >
                              Subida
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5 bg-muted/50 h-20">
                          <ImageIcon className="size-5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Imagen de header
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Header: text */}
                  {headerEnabled &&
                    headerFormat === "TEXT" &&
                    headerText.trim() && (
                      <div className="px-2.5 pt-2.5 pb-0">
                        <p className="text-xs font-semibold leading-snug">
                          {headerText}
                        </p>
                      </div>
                    )}

                  {/* Body */}
                  <div className="px-2.5 py-2">
                    {renderedBody ? (
                      <p className="text-xs leading-relaxed whitespace-pre-wrap text-foreground">
                        {renderedBody}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        El cuerpo del mensaje aparecerá aquí…
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  {footerEnabled && footerText.trim() && (
                    <div className="px-2.5 pb-2">
                      <p className="text-[10px] text-muted-foreground leading-snug">
                        {footerText}
                      </p>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="px-2.5 pb-1.5 flex justify-end">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date().toLocaleTimeString("es", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* Buttons (outside bubble, below) */}
                {buttonsEnabled && buttons.length > 0 && (
                  <div className="w-full max-w-[280px] mt-1 space-y-1">
                    {buttons.map((btn, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-center gap-1.5 rounded-lg border bg-card px-2.5 py-1.5 shadow-sm"
                        aria-label={`Botón: ${btn.text || "sin texto"}`}
                      >
                        <ButtonIcon type={btn.type} />
                        <span className="text-xs font-medium text-primary truncate">
                          {btn.text || (
                            <span className="text-muted-foreground italic">
                              Sin texto
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-20">
                <p className="text-xs text-muted-foreground">
                  Completa el formulario para ver el preview.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Variable substitution note */}
        {bodyVariables.length > 0 && (
          <>
            <Separator className="my-2" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Las variables se reemplazan por los valores de ejemplo que
              ingresas en el formulario. En producción, cada destinatario verá
              su propio valor.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
