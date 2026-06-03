import { useMutation, useQueryClient } from "@tanstack/react-query";
import { whatsappTemplateQkeys } from "./qk";
import { axiosClient } from "../getClientsSelect/Queries/axiosClient";

export interface DeleteWhatsappTemplateResponse {
  success: boolean;
  message?: string;
  id?: string;
  name?: string;
}

export function useDeleteWhatsappTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const { data } = await axiosClient.delete<DeleteWhatsappTemplateResponse>(
        `whatsapp-template/${templateId}`,
      );

      return data;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: whatsappTemplateQkeys.all,
      });
    },
  });
}
