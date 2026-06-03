import type {
  MetaWhatsappTemplate,
  WhatsappTemplateCreateFormState,
  WhatsappTemplateButton,
  TemplateVariable,
  WhatsappTemplateHeaderFormat,
  WhatsappTemplateCategory,
} from "@/Types/whatsapp-campaing/types";

const VALID_HEADER_FORMATS = [
  "TEXT",
  "IMAGE",
  "VIDEO",
  "DOCUMENT",
  "LOCATION",
] as const satisfies readonly WhatsappTemplateHeaderFormat[];

function isWhatsappTemplateHeaderFormat(
  value: unknown,
): value is WhatsappTemplateHeaderFormat {
  return (
    typeof value === "string" &&
    VALID_HEADER_FORMATS.includes(value as WhatsappTemplateHeaderFormat)
  );
}

function normalizeHeaderFormat(value: unknown): WhatsappTemplateHeaderFormat {
  return isWhatsappTemplateHeaderFormat(value) ? value : "TEXT";
}

function normalizeTemplateCategory(value: unknown): WhatsappTemplateCategory {
  if (
    value === "MARKETING" ||
    value === "UTILITY" ||
    value === "AUTHENTICATION"
  ) {
    return value;
  }

  return "MARKETING";
}

function getTemplateComponent(template: MetaWhatsappTemplate, type: string) {
  return template.components?.find(
    (component) => component.type?.toUpperCase() === type.toUpperCase(),
  );
}

function extractBodyVariables(bodyText: string): TemplateVariable[] {
  const matches = Array.from(bodyText.matchAll(/\{\{(\d+)\}\}/g));

  return matches.map((match) => ({
    index: Number(match[1]),
    value: "",
  }));
}

function mapMetaButtonsToFormButtons(
  buttons: WhatsappTemplateButton[] | undefined,
): WhatsappTemplateButton[] {
  if (!Array.isArray(buttons)) return [];

  return buttons.map((button) => ({
    ...button,
    type: button.type,
    text: button.text ?? "",
    url: button.url,
    phone_number: button.phone_number,
    example: button.example,
  }));
}

export function mapMetaTemplateToPreviewForm(
  template: MetaWhatsappTemplate,
  options?: {
    headerPreviewUrl?: string;
  },
): WhatsappTemplateCreateFormState {
  const header = getTemplateComponent(template, "HEADER");
  const body = getTemplateComponent(template, "BODY");
  const footer = getTemplateComponent(template, "FOOTER");
  const buttons = getTemplateComponent(template, "BUTTONS");

  const headerFormat = normalizeHeaderFormat(header?.format);
  const bodyText = body?.text ?? "";

  return {
    name: template.name,
    language: template.language,
    category: normalizeTemplateCategory(template.category),

    headerEnabled: !!header,
    headerFormat,
    headerText: headerFormat === "TEXT" ? (header?.text ?? "") : "",
    headerPreviewUrl: options?.headerPreviewUrl ?? "",
    headerHandle: header?.example?.header_handle?.[0] ?? "",

    bodyText,
    bodyVariables: extractBodyVariables(bodyText),

    footerEnabled: !!footer,
    footerText: footer?.text ?? "",

    buttonsEnabled:
      Array.isArray(buttons?.buttons) && buttons.buttons.length > 0,
    buttons: mapMetaButtonsToFormButtons(buttons?.buttons),
  };
}
