import { useQueryClient } from "@tanstack/react-query";
import { erp } from "@/API/erpApi";
import { erpEndpoints } from "@/API/routes/endpoints";
import {
  DASHBOARD_AUTH_FILTERS,
  DashboardAuthorizationFilters,
  dashboardQkeys,
} from "./qk";

import type { CajaConSaldo } from "@/utils/components/SelectMethodPayment/PurchasePaymentFormDialog";
import { CreditAuthorizationListResponse } from "@/Pages/NewDashboard/credit-authorizations/interfaces/Interfaces.interfaces";
import { SimpleCredit } from "@/Pages/NewDashboard/credit-authorizations/interfaces/credit-records";
import {
  Reparacion,
  Solicitud,
  SolicitudTransferencia,
} from "@/Pages/NewDashboard/types/dashboard";
import { PayloadAcceptCredito } from "@/Pages/NewDashboard/credit-authorizations/interfaces/accept-credito.dto";
import { GarantiaType } from "@/Pages/NewDashboard/types/newGarantyTypes";

export interface RejectDashboardCreditDto {
  authId: number | undefined;
  adminId: number;
  sucursalId: number | null;
  motivoRechazo: string;
}

export interface DashboardWarrantyUpdateDto {
  comentario: string;
  descripcionProblema: string;
  estado: string | null;
}

export interface DashboardWarrantyFinishDto {
  garantiaId: number;
  usuarioId: number;
  estado: string;
  productoId: number;
  conclusion: string;
  accionesRealizadas: string;
}

export interface AcceptTransferRequestDto {
  idSolicitudTransferencia: number;
  userID: number;
}

export function useDashboardProveedores() {
  return erp.useQueryApi<Array<{ id: number; nombre: string }>>(
    dashboardQkeys.proveedores(),
    erpEndpoints.dashboard.proveedores,
    undefined,
    {
      staleTime: 5 * 60_000,
      refetchOnWindowFocus: false,
    },
  );
}

export function useDashboardCuentasBancarias() {
  return erp.useQueryApi<Array<{ id: number; nombre: string }>>(
    dashboardQkeys.cuentasBancarias(),
    erpEndpoints.dashboard.cuentas_bancarias,
    undefined,
    {
      staleTime: 5 * 60_000,
      refetchOnWindowFocus: false,
    },
  );
}

export function useDashboardCajasDisponibles(sucursalId: number) {
  return erp.useQueryApi<CajaConSaldo[]>(
    dashboardQkeys.cajasDisponibles(sucursalId),
    erpEndpoints.cajas.disponibles(sucursalId),
    undefined,
    {
      enabled: !!sucursalId,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  );
}

export function useDashboardCreditAuthorizations(
  filters: DashboardAuthorizationFilters = DASHBOARD_AUTH_FILTERS,
) {
  return erp.useQueryApi<CreditAuthorizationListResponse>(
    dashboardQkeys.creditAuthorizations.list(filters),
    erpEndpoints.dashboard.credit_authorizations.list,
    {
      params: filters,
    },
    {
      refetchOnMount: "always",
      staleTime: 0,
    },
  );
}

export function useDashboardSimpleCredits() {
  return erp.useQueryApi<SimpleCredit[]>(
    dashboardQkeys.creditRecords.simple(),
    erpEndpoints.dashboard.credit_records.simple_dashboard,
    undefined,
    {
      refetchOnMount: "always",
      staleTime: 0,
    },
  );
}

export function useDashboardPriceRequests(sucursalId: number) {
  return erp.useQueryApi<Solicitud[]>(
    dashboardQkeys.priceRequests.list(sucursalId),
    erpEndpoints.dashboard.price_requests.list,
    undefined,
    {
      enabled: !!sucursalId,
      staleTime: 15_000,
      refetchOnWindowFocus: false,
    },
  );
}

export function useDashboardTransferRequests(sucursalId: number) {
  return erp.useQueryApi<SolicitudTransferencia[]>(
    dashboardQkeys.transferRequests.list(sucursalId),
    erpEndpoints.dashboard.transfer_requests.list,
    undefined,
    {
      enabled: !!sucursalId,
      staleTime: 15_000,
      refetchOnWindowFocus: false,
    },
  );
}

export function useDashboardWarranties() {
  return erp.useQueryApi<GarantiaType[]>(
    dashboardQkeys.warranties.list(),
    erpEndpoints.dashboard.warranties.list,
    undefined,
    {
      staleTime: 15_000,
      refetchOnWindowFocus: false,
    },
  );
}

export function useDashboardOpenedRepairs() {
  return erp.useQueryApi<Reparacion[]>(
    dashboardQkeys.repairs.opened(),
    erpEndpoints.dashboard.repairs.opened,
    undefined,
    {
      staleTime: 15_000,
      refetchOnWindowFocus: false,
    },
  );
}

export function useAcceptDashboardCreditAuthorization() {
  const queryClient = useQueryClient();

  return erp.useMutationApi<any, PayloadAcceptCredito>(
    "post",
    erpEndpoints.dashboard.credit_authorizations.accept,
    undefined,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: dashboardQkeys.creditAuthorizations.root(),
        });

        queryClient.invalidateQueries({
          queryKey: dashboardQkeys.creditRecords.root(),
        });
      },
    },
  );
}

export function useRejectDashboardCreditAuthorization() {
  const queryClient = useQueryClient();

  return erp.useMutationApi<any, RejectDashboardCreditDto>(
    "patch",
    erpEndpoints.dashboard.credit_authorizations.reject,
    undefined,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: dashboardQkeys.creditAuthorizations.root(),
        });

        queryClient.invalidateQueries({
          queryKey: dashboardQkeys.creditRecords.root(),
        });
      },
    },
  );
}

export function useAcceptDashboardTransferRequest(sucursalId: number) {
  const queryClient = useQueryClient();

  return erp.useMutationApi<any, AcceptTransferRequestDto>(
    "post",
    erpEndpoints.dashboard.transfer_requests.accept,
    undefined,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: dashboardQkeys.transferRequests.list(sucursalId),
        });
      },
    },
  );
}

export function useUpdateDashboardWarranty(warrantyId: number) {
  const queryClient = useQueryClient();

  return erp.useMutationApi<any, DashboardWarrantyUpdateDto>(
    "patch",
    erpEndpoints.dashboard.warranties.update(warrantyId),
    undefined,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: dashboardQkeys.warranties.root(),
        });
      },
    },
  );
}

export function useFinishDashboardWarranty() {
  const queryClient = useQueryClient();

  return erp.useMutationApi<any, DashboardWarrantyFinishDto>(
    "post",
    erpEndpoints.dashboard.warranties.finish,
    undefined,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: dashboardQkeys.warranties.root(),
        });
      },
    },
  );
}

/**
 * Estos dos hooks necesitan endpoint dinámico por ID en path.
 * Funcionan si el ID ya está disponible al instanciar el hook.
 * Para acciones directas desde una lista, lo más limpio sería mover el backend
 * a endpoints con body, por ejemplo:
 * PATCH price-request/accept { idSolicitud, userId }
 * PATCH price-request/reject { idSolicitud, userId }
 */
export function useAcceptDashboardPriceRequest(
  idSolicitud: number,
  userId: number,
  sucursalId: number,
) {
  const queryClient = useQueryClient();

  return erp.useMutationApi<void, void>(
    "patch",
    erpEndpoints.dashboard.price_requests.accept(idSolicitud, userId),
    undefined,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: dashboardQkeys.priceRequests.list(sucursalId),
        });
      },
    },
  );
}

export function useRejectDashboardPriceRequest(
  idSolicitud: number,
  userId: number,
  sucursalId: number,
) {
  const queryClient = useQueryClient();

  return erp.useMutationApi<void, void>(
    "patch",
    erpEndpoints.dashboard.price_requests.reject(idSolicitud, userId),
    undefined,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: dashboardQkeys.priceRequests.list(sucursalId),
        });
      },
    },
  );
}

export function useRejectDashboardTransferRequest(
  idSolicitudTransferencia: number,
  userId: number,
  sucursalId: number,
) {
  const queryClient = useQueryClient();

  return erp.useMutationApi<void, void>(
    "delete",
    erpEndpoints.dashboard.transfer_requests.reject(
      idSolicitudTransferencia,
      userId,
    ),
    undefined,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: dashboardQkeys.transferRequests.list(sucursalId),
        });
      },
    },
  );
}
