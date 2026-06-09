"use client";

import { useMemo } from "react";
import { toast } from "sonner";
import { useProveedoresSelect } from "@/hooks/getProveedoresSelect/proveedores";
import { SendToComprasDTO } from "@/Types/requisiciones/requisiciones-tables";
import { ProveedorOption } from "./send-to-purchase";
import { RequisitionsTable } from "./requisiciones-table";
import { useGetPresupuestosPartidas } from "@/hooks/use-presupuestos-partidas/use-presupuestos-partidas";
import {
  CreateCompraSinCargoFromRequisicionDto,
  useDeleteRequisicion,
  useGenerarCompra,
  useGetRequisiciones,
  useRecepcionSinCargo,
} from "@/hooks/use-requisiciones/use-requisiciones";
import { useStore } from "@/components/Context/ContextSucursal";

const getApiErrorMessageAxios = (err: unknown): string =>
  (err as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ??
  (err as { message?: string })?.message ??
  "Error desconocido";

export function RequisicionesPage() {
  const userId = useStore((state) => state.userId) ?? 0;
  const { data: partidas_presupuestos } = useGetPresupuestosPartidas();
  const partidas = partidas_presupuestos ? partidas_presupuestos : [];

  const {
    data: requisiciones = [],
    isFetching: isLoadingRequisiciones,
    isError: isErrorRequisiciones,
    error: errorRequisiciones,
    refetch: refetchRequisiciones,
  } = useGetRequisiciones();

  const { data: proveedoresRaw = [] } = useProveedoresSelect();

  const proveedores: ProveedorOption[] = useMemo(
    () =>
      (proveedoresRaw ?? []).map((p) => ({
        id: p.id,
        nombre: p.nombre,
        telefonoContacto: p.telefonoContacto,
      })),
    [proveedoresRaw],
  );

  const mutationSendToCompras = useGenerarCompra();

  const mutationRecepcionSinCargo = useRecepcionSinCargo();
  const isPendingRecepcionSinCargo = mutationRecepcionSinCargo.isPending;

  const mutationDeleteRequisicion = useDeleteRequisicion();

  const handleSendToCompras = async (dto: SendToComprasDTO) => {
    if (!dto.requisicionID || !dto.userID || !dto.proveedorId) {
      toast.warning("Faltan datos para el envío");
      return;
    }

    await toast.promise(mutationSendToCompras.mutateAsync(dto), {
      loading: "Enviando a módulo de compras...",
      success: "Requisición enviada a compras",
      error: (err) => getApiErrorMessageAxios(err),
    });
  };

  const handleRecepcionSinCargo = async (
    dto: CreateCompraSinCargoFromRequisicionDto,
  ) => {
    if (!dto.requisicionID || !dto.userID) {
      toast.warning("Faltan datos para el envío");
      return;
    }

    await toast.promise(mutationRecepcionSinCargo.mutateAsync(dto), {
      loading: "Recepcionando requisición sin gasto...",
      success: "Requisición recepcionada a stock sin gasto",
      error: (err) => getApiErrorMessageAxios(err),
    });
  };

  const handleDeleteRequisicion = async (id: number) => {
    if (!id) {
      toast.warning("ID de requisición inválido");
      return;
    }

    await toast.promise(mutationDeleteRequisicion.mutateAsync(id), {
      loading: "Eliminando requisición...",
      success: "Requisición eliminada correctamente",
      error: (err) => getApiErrorMessageAxios(err),
    });
  };

  return (
    <div className="">
      <RequisitionsTable
        userId={userId}
        isPendingRecepcionSinCargo={isPendingRecepcionSinCargo}
        data={requisiciones}
        handleRecepcionSinCargo={handleRecepcionSinCargo}
        isLoading={isLoadingRequisiciones}
        isError={isErrorRequisiciones}
        error={errorRequisiciones}
        onRefetch={refetchRequisiciones}
        proveedores={proveedores}
        partidas={partidas}
        isSendingToCompras={mutationSendToCompras.isPending}
        isDeletingRequisicion={mutationDeleteRequisicion.isPending}
        onSendToCompras={handleSendToCompras}
        onDeleteRequisicion={handleDeleteRequisicion}
      />
    </div>
  );
}

export default RequisicionesPage;
