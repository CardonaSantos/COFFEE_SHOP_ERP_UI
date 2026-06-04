import { WhatsappTemplateFilters } from "@/Types/whatsapp-campaing/types";

export const whatsappTemplateQkeys = {
  all: ["whatsapp-templates"] as const,

  list: (filters: Partial<WhatsappTemplateFilters>) =>
    [
      ...whatsappTemplateQkeys.all,
      "list",
      {
        name: filters.name?.trim() ?? "",
        language: filters.language ?? "ALL",
        category: filters.category ?? "ALL",
        status: filters.status ?? "ALL",
      },
    ] as const,
};
