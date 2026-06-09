import { erp } from "@/API/erpApi";
import { erpEndpoints } from "@/API/routes/endpoints";
import { CreateRequisitionDto } from "@/Pages/requisiciones/requisicion.queries";
import { useInvalidateHandler } from "@/utils/query";
import { requisicionesQkeys } from "./Qk";
import {
  PagedResponse,
  RequisitionProductCandidate,
  RequisitionResponse,
  RequisitionResponseDTO,
} from "@/Types/requisiciones/requisiciones-tables";
import { keepPreviousData, useMutation } from "@tanstack/react-query";
import { erpApi } from "@/API/axiosClientCrm";
import { presupuesto_partidasQkeys } from "../use-presupuestos-partidas/Qk";

export interface CreateCompraSinCargoFromRequisicionDto {
  requisicionID: number;
  userID: number;

  proveedorId?: number | null;

  sucursalId?: number | null;

  observaciones?: string | null;
}

export interface UpdateRequisitionDto {
  requisicionId: number;
  sucursalId: number;
  usuarioId: number;
  lineas: {
    productoId: number;
    cantidadSugerida: number;
  }[];
}

export interface dataCreateCompra {
  requisicionID: number | undefined;
  userID: number;
  proveedorId: number;
}

export interface StockAlertItem {
  id: number;
}

interface CandidateParams {
  page: number;
  pageSize: number;
  q?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export function useGetRequisitionCandidates(
  sucursalId: number,
  params: CandidateParams,
  options?: { enabled?: boolean },
) {
  return erp.useQueryApi<PagedResponse<RequisitionProductCandidate>>(
    requisicionesQkeys.candidates(sucursalId, params),
    erpEndpoints.requisiciones.candidates,
    {
      params: {
        sucursalId,
        page: params.page,
        pageSize: params.pageSize,
        q: params.q || "",
        sortBy: params.sortBy || "prioridad",
        sortDir: params.sortDir || "asc",
      },
    },
    {
      enabled: !!sucursalId && (options?.enabled ?? true),
      placeholderData: keepPreviousData,
    },
  );
}

/** Obtener todas las requisiciones */
export function useGetRequisiciones() {
  return erp.useQueryApi<Array<RequisitionResponseDTO>>(
    requisicionesQkeys.all,
    erpEndpoints.requisiciones.findAll,
  );
}

/** Obtener alertas de stock (Preview) */
export function useGetStockAlerts(sucursalId: number) {
  // Nota: Agregué la ruta manualmente aquí ya que no estaba en tu objeto erpEndpoints
  const url = `/requisicion/preview?sucursalId=${sucursalId}`;

  return erp.useQueryApi<StockAlertItem[]>(
    requisicionesQkeys.preview(sucursalId),
    url,
  );
}

/** Obtener detalle de una sola requisición */
export function useGetOneRequisicion(id: number) {
  return erp.useQueryApi<RequisitionResponse>(
    requisicionesQkeys.detail(id),
    erpEndpoints.requisiciones.get_one(id),
  );
}

/** Obtener datos de requisición para edición */
export function useGetRequisicionToEdit(id: number) {
  return erp.useQueryApi<RequisitionResponse>( // Ajusta el tipo si devuelve un DTO distinto
    requisicionesQkeys.toEdit(id),
    erpEndpoints.requisiciones.get_requisicion_to_edit(id),
  );
}

// ---- MUTATIONS

/** Crear una nueva requisición */
export function useCreateRequisicion() {
  const invalidate = useInvalidateHandler();

  return erp.useMutationApi<void, CreateRequisitionDto>(
    "post",
    erpEndpoints.requisiciones.create,
    undefined,
    {
      onSuccess: () => {
        invalidate(requisicionesQkeys.all);
      },
    },
  );
}

/** Actualizar una requisición existente */
export function useUpdateRequisicion() {
  const invalidate = useInvalidateHandler();

  return erp.useMutationApi<void, UpdateRequisitionDto>(
    "put", // Asumiendo que tu erpApi wrapper acepta "put"
    erpEndpoints.requisiciones.update_requisicion(),
    undefined,
    {
      onSuccess: (_, variables) => {
        invalidate(requisicionesQkeys.all);
        invalidate(requisicionesQkeys.toEdit(variables.requisicionId));
        invalidate(requisicionesQkeys.detail(variables.requisicionId));
      },
    },
  );
}

/** Generar compra desde requisición */
export function useGenerarCompra() {
  const invalidate = useInvalidateHandler();

  return erp.useMutationApi<void, dataCreateCompra>(
    "post",
    erpEndpoints.requisiciones.generate_purchase,
    undefined,
    {
      onSuccess: () => {
        invalidate(requisicionesQkeys.all);
        invalidate(requisicionesQkeys.all);
        invalidate(presupuesto_partidasQkeys.all);
      },
    },
  );
}

/**
 * RECEPCIONAR UNA REQUISICION/COMPRA SIN GASTO
 * @returns
 */
export function useRecepcionSinCargo() {
  const invalidate = useInvalidateHandler();

  return erp.useMutationApi<void, CreateCompraSinCargoFromRequisicionDto>(
    "post",
    erpEndpoints.requisiciones.recepcion_sin_cargo,
    undefined,
    {
      onSuccess: () => {
        invalidate(requisicionesQkeys.all);
        invalidate(requisicionesQkeys.all);
        invalidate(presupuesto_partidasQkeys.all);
      },
    },
  );
}

/** * Eliminar una requisición
 * Nota: El ID se pasa al inicializar el hook porque el endpoint lo requiere en la URL.
 * Uso: const deleteMutation = useDeleteRequisicion(id);
 */
/**
 * Eliminar una requisición dinámicamente
 */
export function useDeleteRequisicion() {
  const invalidate = useInvalidateHandler();

  return useMutation({
    // La mutación recibe el ID numérico
    mutationFn: (id: number) => {
      // Haces el llamado directo construyendo el endpoint en tiempo de ejecución
      return erpApi.delete(erpEndpoints.requisiciones.delete(id));
    },
    onSuccess: () => {
      invalidate(requisicionesQkeys.all);
    },
  });
}

/** * Realizar el Make Requisiciones Stock
 * Uso: const makeStockMutation = useMakeRequisicionStock(id);
 */
export function useMakeRequisicionStock(id: number) {
  const invalidate = useInvalidateHandler();

  return erp.useMutationApi<void, void>(
    "post",
    erpEndpoints.requisiciones.make_requisicion(id),
    undefined,
    {
      onSuccess: () => {
        invalidate(requisicionesQkeys.all);
        invalidate(requisicionesQkeys.detail(id));
      },
    },
  );
}
