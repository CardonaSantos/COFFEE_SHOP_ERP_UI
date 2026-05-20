import { erp } from "@/API/erpApi";
import { erpEndpoints } from "@/API/routes/endpoints";
import { productsQkeys, normalizeInventaryQuery } from "./qk";
import { QueryTable } from "@/Pages/InventarioYStock/interfaces/querytable";
import { PaginatedInventarioResponse } from "@/Pages/InventarioYStock/interfaces/InventaryInterfaces";

export interface PayloadDeleteProduct {
  userId: number;
  password: string;
}

export function useDeleteProduct(id: number) {
  return erp.useMutationApi<void, PayloadDeleteProduct>(
    "delete",
    erpEndpoints.productos.delete_product(id),
  );
}

export function useGetInventary(query: QueryTable) {
  const normalizedQuery = normalizeInventaryQuery(query);

  return erp.useQueryApi<void, PaginatedInventarioResponse>(
    productsQkeys.inventaryParams(normalizedQuery),
    erpEndpoints.productos.inventary,
    {
      params: normalizedQuery,
    },
  );
}
