import { useMutation } from "@tanstack/react-query";
import { erpEndpoints } from "@/API/routes/endpoints";
import { erpApi } from "@/API/axiosClientCrm";

export function useDeleteProductImage() {
  return useMutation({
    mutationFn: async (imageId: number) => {
      const { data } = await erpApi.delete(
        erpEndpoints.productos.delete_image(imageId),
      );

      return data;
    },
  });
}
