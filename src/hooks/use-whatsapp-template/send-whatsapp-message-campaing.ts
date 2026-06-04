import { useMutation } from "@tanstack/react-query";
import { axiosClient } from "../getClientsSelect/Queries/axiosClient";
// src/Types/whatsapp/whatsapp-campaign.types.ts

export type WhatsappCampaignSendMode = "ALL_VALID" | "SELECTED";

export type WhatsappTemplateCategory =
  | "MARKETING"
  | "UTILITY"
  | "AUTHENTICATION";

export interface WhatsappCampaignRecipient {
  customerId: number;
  fullName: string;
  phone: string;
}

export interface WhatsappCampaignEstimatedCost {
  currency: "USD" | "GTQ";
  unitCost: number;
  totalRecipients: number;
  totalEstimated: number;
}

export interface WhatsappCampaignFiltersSnapshot {
  search: string;
  purchaseFilter: string;
  phoneFilter: string;
  locationFilter: string;
}

export interface SendWhatsappCampaignPayload {
  templateId: string;
  templateName: string;
  templateLanguage: string;
  templateCategory: WhatsappTemplateCategory | string;

  sendMode: WhatsappCampaignSendMode;
  customerIds: number[];

  recipients: WhatsappCampaignRecipient[];

  estimatedCost: WhatsappCampaignEstimatedCost;
  filtersSnapshot: WhatsappCampaignFiltersSnapshot;

  createdAt: string;
}

export interface SendWhatsappCampaignResponse {
  ok: boolean;
  templateName: string;
  templateLanguage: string;
  templateCategory: string;
  requestedRecipients: number;
  validRecipients: number;
  sent: number;
  failed: number;
  results: Array<{
    customerId: number;
    phone: string;
    fullName: string;
    success: boolean;
    response?: unknown;
    error?: string;
  }>;
}

export function useSendWhatsappCampaign() {
  return useMutation({
    mutationFn: async (payload: SendWhatsappCampaignPayload) => {
      const { data } = await axiosClient.post<SendWhatsappCampaignResponse>(
        "whatsapp-campaigns/send-massive-message",
        payload,
      );

      return data;
    },
  });
}
