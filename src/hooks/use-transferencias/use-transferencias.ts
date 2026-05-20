import { useQueryClient } from "@tanstack/react-query";
import { erp } from "@/API/erpApi";
import { erpEndpoints } from "@/API/routes/endpoints";
import { transferenciaQkeys } from "./Qk";

// === QUERIES ================================================================

export function useGetProductosTransferencia(sucursalId?: number) {
  return erp.useQueryApi<any[]>(
    transferenciaQkeys.productos(sucursalId!),
    erpEndpoints.productos.get_to_transfer(sucursalId!),
    undefined,
    {
      enabled: !!sucursalId,
    },
  );
}

export function useGetSucursalesTransferencia() {
  return erp.useQueryApi<any[]>(
    transferenciaQkeys.sucursales(),
    erpEndpoints.sucursales.get_to_transfer,
    undefined,
    undefined,
  );
}

// === MUTATION ==============================================================

export function useSolicitarTransferencia() {
  const queryClient = useQueryClient();

  return erp.useMutationApi<any, any>(
    "post",
    erpEndpoints.transferencias.solicitar,
    undefined,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: transferenciaQkeys.all,
          refetchType: "all",
        });
      },
    },
  );
}
