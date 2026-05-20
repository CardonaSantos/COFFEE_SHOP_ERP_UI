import { TipoPresentacion } from "@/Pages/newCreateProduct/interfaces/DomainProdPressTypes";
import { useApiQuery } from "../genericoCall/genericoCallHook";
import { tipoPresentacionesQkeys } from "./Qk";
import { PaginatedResponse } from "@/Pages/tipos-presentaciones/Interfaces/tiposPresentaciones.interfaces";

export function useTiposPresentaciones() {
  return useApiQuery<PaginatedResponse<TipoPresentacion>>(
    tipoPresentacionesQkeys.all,
    "tipo-presentacion",
  );
}
