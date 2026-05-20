// stock/hooks.ts
import { useQueryClient } from "@tanstack/react-query";
import { erp } from "@/API/erpApi";
import { erpEndpoints } from "@/API/routes/endpoints";
import { stockQkeys } from "./Qk";
import { StockToEditResponse } from "@/Types/stock/stock-edit-response";

// === QUERIES ================================================================

export function useGetStockToEdit(id?: number) {
  return erp.useQueryApi<StockToEditResponse>(
    stockQkeys.toEdit(id!),
    erpEndpoints.stock.get_to_edit(id!),
    undefined,
    {
      enabled: !!id,
      staleTime: 0,
      refetchOnWindowFocus: "always",
    },
  );
}

export function useUpdateStock() {
  const queryClient = useQueryClient();

  return erp.useMutationApi<any, any>(
    "patch",
    erpEndpoints.stock.update,
    undefined,
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: stockQkeys.toEdit(variables.id),
        });

        queryClient.invalidateQueries({
          queryKey: stockQkeys.lists(),
          refetchType: "all",
        });
      },
    },
  );
}
