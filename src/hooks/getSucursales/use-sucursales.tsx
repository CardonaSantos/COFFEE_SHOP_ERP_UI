import { useQuery } from "@tanstack/react-query";
import { sucursalesKey, sucursalesQueryOptions } from "./Queries/sucursales";
import { erp } from "@/API/erpApi";
import { erpEndpoints } from "@/API/routes/endpoints";
import { SucursalResponseSelect } from "./Interfaces/interfaces";
import { Sucursal } from "@/Types/Sucursal/Sucursal_Info";

export default function useGetSucursales() {
  return useQuery(sucursalesQueryOptions());
}

export function useGetSucursalesList() {
  return erp.useQueryApi<Array<SucursalResponseSelect>>(
    sucursalesKey.all,
    erpEndpoints.sucursales.todas_sucursales,
  );
}

export function useGetSucursal(sucursalId: number) {
  return erp.useQueryApi<Sucursal>(
    sucursalesKey.all,
    erpEndpoints.sucursales.sucursal(sucursalId),
  );
}
