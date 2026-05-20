import { erpEndpoints } from "@/API/routes/endpoints";
import { cajasQkeys } from "./Qk";
import { erp } from "@/API/erpApi";
import { CajaConSaldo } from "@/utils/components/SelectMethodPayment/PurchasePaymentFormDialog";

import { CajaAbierta, IniciarCaja } from "@/Pages/Caja/types/interfaces";
import { useInvalidateHandler } from "@/utils/query";
import {
  CerrarCajaV3Dto,
  PreviaCierreResponse,
} from "@/Pages/Caja/types/cierres.types";
import { CrearMovimientoFinancieroDto } from "@/Pages/Caja/Movimientos/movimientos-financieros";
import { PaginatedRegistrosCajaResponse } from "@/Pages/CajaRegistros/interfaces/registroscajas.interfaces";
import { PagedResponseMovimientos } from "@/Pages/movimientos-cajas/Interfaces/registroCajas";

export type GetCajasQuery = {
  page?: number;
  limit?: number;
  sucursalId?: number;
  estado?: "ABIERTO" | "CERRADO" | "ARQUEO";
  depositado?: boolean;

  fechaAperturaInicio?: string;
  fechaAperturaFin?: string;
  fechaCierreInicio?: string;
  fechaCierreFin?: string;

  tipo?: string | string[];
  categoria?: string | string[];
  fechaMovInicio?: string;
  fechaMovFin?: string;
  search?: string;

  groupBySucursal?: boolean;
};

export type GetMovimientosQuery = {
  page?: number;
  limit?: number;
  sucursalId?: number;
  search?: string;
  usadoParaCierre?: boolean;
  groupBySucursal?: boolean;

  // filtros por movimiento
  tipo?: string | string[]; // p.ej: ["INGRESO","EGRESO"]
  categoria?: string | string[]; // p.ej: ["DEPOSITO_CIERRE","GASTO_OPERATIVO"]
  fechaInicio?: string;
  fechaFin?: string;
};

/**
 * GETTER DE SELECT PARA CAJAS DISPONIBLES
 * @param sucursalId
 * @returns
 */
export function useGetCajasDisponibles(sucursalId: number) {
  return erp.useQueryApi<CajaConSaldo[]>(
    cajasQkeys.cajas(sucursalId),
    erpEndpoints.cajas.disponibles(sucursalId),
    undefined,
    { enabled: !!sucursalId, staleTime: 30_000, refetchOnWindowFocus: false },
  );
}

/**
 * CERRAR EL TURNO
 * @returns
 */
export function useCloseCaja() {
  const query = useInvalidateHandler();

  return erp.useMutationApi<CerrarCajaV3Dto>(
    "post",
    erpEndpoints.cajas.cerrar_caja,
    undefined,
    {
      onSuccess: () => {
        query(cajasQkeys.all);
      },
    },
  );
}

/**
 * INICAR TURNO EN CAJA
 * @returns
 */
export function useIniciarCaja() {
  const query = useInvalidateHandler();
  return erp.useMutationApi<IniciarCaja>(
    "post",
    erpEndpoints.cajas.iniciar_caja,
    undefined,
    {
      onSuccess: () => {
        query(cajasQkeys.all);
      },
    },
  );
}

/**
 * PREVIA A CIERRE - DATOS REALES
 * @param sucursalId
 * @param registroCajaId
 * @param usuarioId
 * @returns
 */
export function useGetPreviaCaja(
  sucursalId: number,
  registroCajaId: number,
  usuarioId: number,
) {
  return erp.useQueryApi<PreviaCierreResponse>(
    cajasQkeys.caja_previa_data(sucursalId, registroCajaId),
    erpEndpoints.cajas.caja_previa_data,
    {
      params: {
        sucursalId: sucursalId,
        registroCajaId: registroCajaId,
        usuarioId: usuarioId,
      },
    },
    {
      enabled: !!registroCajaId,
    },
  );
}

/**
 * GET ULTIMA CAJA ABIERTA EN TURNO
 * @param sucursalId
 * @param userId
 * @returns
 */
export function useGetUltimaCajaAbierta(sucursalId: number, userId: number) {
  return erp.useQueryApi<CajaAbierta>(
    cajasQkeys.ultima_caja_abierta(),
    erpEndpoints.cajas.ultima_caja_abierta(sucursalId, userId),
    undefined,
    undefined,
  );
}

/**
 * GETTER ULTIMO SALDO DE LA SUCURSAL - INICAR TURNO
 * @param sucursalId
 * @param userId
 * @returns
 */
export function useGetUltimoSaldoSucursal(sucursalId: number, userId: number) {
  return erp.useQueryApi<number>(
    cajasQkeys.ultimo_saldo_sucursal(),
    erpEndpoints.cajas.ultimo_saldo_sucursal(sucursalId, userId),
    undefined,
    undefined,
  );
}

export function useDeleteMovimiento(movimientoId: number) {
  return erp.useMutationApi<void, void>(
    "delete",
    erpEndpoints.movimiento.delete_movimiento(movimientoId),
    undefined,
    undefined,
  );
}

export function useCreateMovimientoFinanciero() {
  return erp.useMutationApi<CrearMovimientoFinancieroDto>(
    "post",
    erpEndpoints.movimiento.create_movimiento,
    undefined,
    undefined,
  );
}

/**
 *  GET DE CAJAS TABLA
 * @param params
 * @returns
 */
export function useGetRegistrosCajas(params: GetCajasQuery = {}) {
  return erp.useQueryApi<PaginatedRegistrosCajaResponse>(
    cajasQkeys.registros(params),
    erpEndpoints.cajas.list_registros,
    {
      params: {
        page: params.page,
        limit: params.limit,
        sucursalId: params.sucursalId,
        estado: params.estado,
        depositado: params.depositado,
        fechaAperturaInicio: params.fechaAperturaInicio,
        fechaAperturaFin: params.fechaAperturaFin,
        fechaCierreInicio: params.fechaCierreInicio,
        fechaCierreFin: params.fechaCierreFin,
        tipo: params.tipo,
        categoria: params.categoria,
        fechaMovInicio: params.fechaMovInicio,
        fechaMovFin: params.fechaMovFin,
        search: params.search,
        groupBySucursal: params.groupBySucursal,
      },
    },
    {
      enabled: true,
      staleTime: 0,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  );
}

export function useGetRegistrosMovimientos(params: GetMovimientosQuery = {}) {
  return erp.useQueryApi<PagedResponseMovimientos>(
    cajasQkeys.registros_movimientos(params),
    erpEndpoints.movimiento.list_movimientos,
    {
      params: {
        page: params.page,
        limit: params.limit,
        sucursalId: params.sucursalId,
        search: params.search,
        usadoParaCierre: params.usadoParaCierre,
        groupBySucursal: params.groupBySucursal,
        tipo: params.tipo,
        categoria: params.categoria,
        fechaInicio: params.fechaInicio,
        fechaFin: params.fechaFin,
      },
    },
    {
      enabled: true,
      staleTime: 0,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  );
}

export function useGetReportCajas() {
  console.log("entrando a get reporte cajas");

  return erp.useMutationApi<Array<number>>(
    "post",
    erpEndpoints.excel.cajas,
    {
      responseType: "blob",
    },
    undefined,
  );
}

// const res = await axios.post(`${API_URL}/movimiento-financiero`, data);
