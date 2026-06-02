import {
  MetaListResponse,
  MetaWhatsappTemplate,
  WhatsappTemplateFilters,
} from "@/Types/whatsapp-campaing/types";
import { useApiQuery } from "../genericoCall/genericoCallHook";
import { whatsappTemplateQkeys } from "./qk";

function buildWhatsappTemplateQueryParams(
  filters: Partial<WhatsappTemplateFilters>,
) {
  const params = new URLSearchParams();

  if (filters.name?.trim()) {
    params.set("name", filters.name.trim());
  }

  if (filters.language && filters.language !== "ALL") {
    params.set("language", filters.language);
  }

  if (filters.category && filters.category !== "ALL") {
    params.set("category", filters.category);
  }

  if (filters.status && filters.status !== "ALL") {
    params.set("status", filters.status);
  }

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
}

export function useWhatsappTemplates(
  filters: Partial<WhatsappTemplateFilters> = {},
) {
  const queryParams = buildWhatsappTemplateQueryParams(filters);

  return useApiQuery<MetaListResponse<MetaWhatsappTemplate>>(
    whatsappTemplateQkeys.list(filters),
    `whatsapp-template${queryParams}`,
    undefined,
    {
      staleTime: 0,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: 1,
    },
  );
}
