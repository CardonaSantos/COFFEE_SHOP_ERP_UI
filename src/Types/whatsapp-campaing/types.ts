// ─── Domain types ─────────────────────────────────────────────────────────────

export type WhatsappTemplateCategory =
  | "MARKETING"
  | "UTILITY"
  | "AUTHENTICATION";

export type WhatsappTemplateStatus =
  | "APPROVED"
  | "PENDING"
  | "REJECTED"
  | "PAUSED"
  | "DISABLED"
  | "IN_APPEAL"
  | "PENDING_DELETION";

// ─── Meta API response shapes ─────────────────────────────────────────────────

export interface MetaPagingCursor {
  before?: string;
  after?: string;
}

export interface MetaPaging {
  cursors?: MetaPagingCursor;
  next?: string;
  previous?: string;
}

export interface MetaListResponse<T> {
  data: T[];
  paging?: MetaPaging;
}

export interface MetaWhatsappTemplate {
  id: string;
  name: string;
  status: WhatsappTemplateStatus | string;
  category: WhatsappTemplateCategory | string;
  language: string;
  components?: WhatsappTemplateComponent[];
}

export interface WhatsappTemplateComponent {
  type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS" | "CAROUSEL" | string;
  format?: "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT" | "LOCATION" | string;
  text?: string;
  example?: {
    body_text?: string[][];
    header_text?: string[];
    header_handle?: string[];
    [key: string]: unknown;
  };
  buttons?: WhatsappTemplateButton[];
  cards?: unknown[];
  [key: string]: unknown;
}

export interface WhatsappTemplateButton {
  type: "QUICK_REPLY" | "URL" | "PHONE_NUMBER" | "COPY_CODE" | string;
  text: string;
  url?: string;
  phone_number?: string;
  example?: string[];
  [key: string]: unknown;
}

// ─── UI / filter state ────────────────────────────────────────────────────────

export interface WhatsappTemplateFilters {
  name: string;
  language: string;
  category: WhatsappTemplateCategory | "ALL";
  status: WhatsappTemplateStatus | "ALL";
}

// ─── Component summary item (derived, passed as prop) ─────────────────────────

export interface TemplateComponentSummaryItem {
  label: string;
  detail?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const DEFAULT_FILTERS: WhatsappTemplateFilters = {
  name: "",
  language: "ALL",
  category: "ALL",
  status: "ALL",
};

export const LANGUAGES = ["ALL", "es", "es_GT", "en_US"] as const;

export const CATEGORIES: Array<WhatsappTemplateCategory | "ALL"> = [
  "ALL",
  "UTILITY",
  "MARKETING",
  "AUTHENTICATION",
];

export const STATUSES: Array<WhatsappTemplateStatus | "ALL"> = [
  "ALL",
  "APPROVED",
  "PENDING",
  "REJECTED",
  "PAUSED",
  "DISABLED",
  "IN_APPEAL",
  "PENDING_DELETION",
];

export const PAGE_SIZES = [10, 20, 50] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getBodyPreview(template: MetaWhatsappTemplate): string {
  const body = template.components?.find((c) => c.type === "BODY");
  return body?.text?.trim() || "Sin cuerpo";
}

export function getTemplateComponentSummary(
  template: MetaWhatsappTemplate,
): TemplateComponentSummaryItem[] {
  if (!template.components) return [];
  return template.components.map((c) => {
    if (c.type === "HEADER" && c.format)
      return { label: "HEADER", detail: c.format };
    if (c.type === "BUTTONS" && c.buttons?.length)
      return { label: "BUTTONS", detail: `${c.buttons.length}` };
    return { label: c.type };
  });
}

export function getStatusBadgeMeta(status: string): {
  label: string;
  variant: "default" | "secondary" | "outline" | "destructive";
  iconKey: WhatsappTemplateStatus | "UNKNOWN";
} {
  switch (status) {
    case "APPROVED":
      return { label: "Aprobada", variant: "default", iconKey: "APPROVED" };
    case "PENDING":
      return { label: "Pendiente", variant: "secondary", iconKey: "PENDING" };
    case "REJECTED":
      return {
        label: "Rechazada",
        variant: "destructive",
        iconKey: "REJECTED",
      };
    case "PAUSED":
      return { label: "Pausada", variant: "outline", iconKey: "PAUSED" };
    case "DISABLED":
      return {
        label: "Deshabilitada",
        variant: "outline",
        iconKey: "DISABLED",
      };
    case "IN_APPEAL":
      return {
        label: "En apelación",
        variant: "secondary",
        iconKey: "IN_APPEAL",
      };
    case "PENDING_DELETION":
      return {
        label: "Por eliminar",
        variant: "outline",
        iconKey: "PENDING_DELETION",
      };
    default:
      return { label: status, variant: "outline", iconKey: "UNKNOWN" };
  }
}

export function normalizeStatus(status: string): string {
  return status.replace(/_/g, " ");
}

export function normalizeCategory(category: string): string {
  const map: Record<string, string> = {
    MARKETING: "Marketing",
    UTILITY: "Utilidad",
    AUTHENTICATION: "Auth",
  };
  return map[category] ?? category;
}

export function isFiltersActive(filters: WhatsappTemplateFilters): boolean {
  return (
    filters.name !== "" ||
    filters.language !== "ALL" ||
    filters.category !== "ALL" ||
    filters.status !== "ALL"
  );
}

// NUEVOS TYPES

// ─── Domain enums / unions ────────────────────────────────────────────────────

export type WhatsappTemplateComponentType =
  | "HEADER"
  | "BODY"
  | "FOOTER"
  | "BUTTONS"
  | "CAROUSEL";

export type WhatsappTemplateHeaderFormat =
  | "TEXT"
  | "IMAGE"
  | "VIDEO"
  | "DOCUMENT"
  | "LOCATION";

export type WhatsappTemplateButtonType =
  | "QUICK_REPLY"
  | "URL"
  | "PHONE_NUMBER"
  | "COPY_CODE";

// ─── Sub-shapes ───────────────────────────────────────────────────────────────

export interface WhatsappTemplateExample {
  body_text?: string[][];
  header_text?: string[];
  header_handle?: string[];
  [key: string]: unknown;
}

export interface WhatsappTemplateButton {
  type: WhatsappTemplateButtonType;
  text: string;
  url?: string;
  phone_number?: string;
  example?: string[];
  [key: string]: unknown;
}

export interface WhatsappTemplateComponent {
  type: WhatsappTemplateComponentType;
  format?: WhatsappTemplateHeaderFormat;
  text?: string;
  example?: WhatsappTemplateExample;
  buttons?: WhatsappTemplateButton[];
  cards?: unknown[];
  [key: string]: unknown;
}

// ─── API DTOs ─────────────────────────────────────────────────────────────────

export interface CreateWhatsappTemplateDto {
  name: string;
  language?: string;
  category: WhatsappTemplateCategory;
  components: WhatsappTemplateComponent[];
}

export interface CreateRawWhatsappTemplateDto {
  name: string;
  language?: string;
  category: WhatsappTemplateCategory;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  components: Record<string, any>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
}

export interface CreateUtilityImageTemplateDto {
  name: string;
  language?: string;
  headerHandle?: string;
  bodyText: string;
  bodyExample: string[][];
  footerText?: string;
}

export interface MetaCreateTemplateResponse {
  id: string;
  status: string;
  category?: string;
}

// ─── Meta API response shapes (list / detail) ─────────────────────────────────

export interface MetaPagingCursor {
  before?: string;
  after?: string;
}

export interface MetaPaging {
  cursors?: MetaPagingCursor;
  next?: string;
  previous?: string;
}

export interface MetaListResponse<T> {
  data: T[];
  paging?: MetaPaging;
}

export interface MetaWhatsappTemplate {
  id: string;
  name: string;
  status: WhatsappTemplateStatus | string;
  category: WhatsappTemplateCategory | string;
  language: string;
  components?: WhatsappTemplateComponent[];
}

// ─── Create-form state ────────────────────────────────────────────────────────

export interface TemplateVariable {
  index: number;
  value: string;
}

export interface WhatsappTemplateCreateFormState {
  name: string;
  language: string;
  category: WhatsappTemplateCategory;
  headerEnabled: boolean;
  headerFormat: WhatsappTemplateHeaderFormat;
  headerText: string;
  headerHandle: string;
  bodyText: string;
  bodyVariables: TemplateVariable[];
  footerEnabled: boolean;
  footerText: string;
  buttonsEnabled: boolean;
  buttons: WhatsappTemplateButton[];
}

// ─── List-view UI state ───────────────────────────────────────────────────────

export interface WhatsappTemplateFilters {
  name: string;
  language: string;
  category: WhatsappTemplateCategory | "ALL";
  status: WhatsappTemplateStatus | "ALL";
}

export interface TemplateComponentSummaryItem {
  label: string;
  detail?: string;
}

// ─── Validation ───────────────────────────────────────────────────────────────

export type FormErrors = Partial<Record<string, string>>;

// ─── List-view constants ──────────────────────────────────────────────────────

export const LANGUAGES_LIST = ["es", "es_GT", "en_US"] as const;
export const LANGUAGES_ALL = ["ALL", ...LANGUAGES_LIST] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
