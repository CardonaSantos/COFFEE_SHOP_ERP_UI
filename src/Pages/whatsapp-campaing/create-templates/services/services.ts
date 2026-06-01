import type {
  CreateWhatsappTemplateDto,
  CreateUtilityImageTemplateDto,
  MetaCreateTemplateResponse,
} from "@/Types/whatsapp-campaing/types";

const API_BASE_URL = "http://localhost:3000";

export async function createWhatsappTemplate(
  payload: CreateWhatsappTemplateDto,
): Promise<MetaCreateTemplateResponse> {
  const response = await fetch(`${API_BASE_URL}/whatsapp-template`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.message ??
        errorBody?.meta?.error?.message ??
        "No se pudo enviar la plantilla a revisión",
    );
  }

  return response.json() as Promise<MetaCreateTemplateResponse>;
}

export async function createUtilityImageTemplate(
  payload: CreateUtilityImageTemplateDto,
): Promise<MetaCreateTemplateResponse> {
  const response = await fetch(
    `${API_BASE_URL}/whatsapp-template/utility/image`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.message ??
        errorBody?.meta?.error?.message ??
        "No se pudo enviar la plantilla utility a revisión",
    );
  }

  return response.json() as Promise<MetaCreateTemplateResponse>;
}
