"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Package } from "lucide-react";
import {
  getEstadoBadgeVariant,
  RequisitionResponseDTO,
} from "@/Types/requisiciones/requisiciones-tables";
import { RequisitionRowActions } from "../components/requisiciones-row-actions";
import { formattFecha } from "@/Pages/Utils/Utils";
const formatearMoneda = (n: number) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
  }).format(n);

export interface RequisitionTableMeta {
  onVerDetalle?: (row: RequisitionResponseDTO) => void;
  onImprimir?: (row: RequisitionResponseDTO) => void;
  onSendToCompras?: (row: RequisitionResponseDTO) => void;
  onRecepcionSinCargo?: (row: RequisitionResponseDTO) => void;
  onDeleteRequisicion?: (row: RequisitionResponseDTO) => void;

  isSendingToCompras?: boolean;
  isPendingRecepcionSinCargo?: boolean;
  isDeletingRequisicion?: boolean;
}

export const requisicionColumns: ColumnDef<RequisitionResponseDTO, unknown>[] =
  [
    {
      accessorKey: "folio",
      header: () => <span className="text-xs font-medium">Folio</span>,
      cell: ({ row }) => (
        <span className="font-mono text-xs font-medium">
          {row.original.folio}
        </span>
      ),
    },
    {
      accessorKey: "fecha",
      header: () => (
        <span className="flex items-center gap-1.5 text-xs font-medium">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          Fecha
        </span>
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formattFecha(row.original.fecha)}
        </span>
      ),
    },
    {
      accessorKey: "sucursal.nombre",
      id: "sucursal",
      header: () => <span className="text-xs font-medium">Sucursal</span>,
      cell: ({ row }) => (
        <span className="text-xs">{row.original.sucursal.nombre}</span>
      ),
    },
    {
      accessorKey: "estado",
      header: () => <span className="text-xs font-medium">Estado</span>,
      cell: ({ row }) => (
        <Badge
          variant={getEstadoBadgeVariant(row.original.estado)}
          className="text-[10px] px-1.5 py-0 font-medium whitespace-nowrap"
        >
          {row.original.estado}
        </Badge>
      ),
    },
    {
      accessorKey: "totalLineas",
      header: () => (
        <span className="flex items-center gap-1.5 text-xs font-medium">
          <Package className="h-3.5 w-3.5 text-muted-foreground" />
          Líneas
        </span>
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
          {row.original.totalLineas}
        </Badge>
      ),
    },
    {
      accessorKey: "totalRequisicion",
      header: () => (
        <span className="flex items-center gap-1.5 justify-end text-xs font-medium">
          <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
          Total
        </span>
      ),
      cell: ({ row }) => (
        <span className="text-xs font-medium text-right block">
          {formatearMoneda(row.original.totalRequisicion)}
        </span>
      ),
    },
    {
      id: "acciones",
      header: () => <span className="sr-only">Acciones</span>,
      cell: ({ row, table }) => {
        const meta = table.options.meta as RequisitionTableMeta | undefined;

        return (
          <div className="flex justify-end">
            <RequisitionRowActions
              requisicion={row.original}
              onVerDetalle={meta?.onVerDetalle ?? (() => {})}
              onImprimir={meta?.onImprimir ?? (() => {})}
              onSendToCompras={meta?.onSendToCompras ?? (() => {})}
              onRecepcionSinCargo={meta?.onRecepcionSinCargo ?? (() => {})}
              onDelete={meta?.onDeleteRequisicion}
              isSendingToCompras={!!meta?.isSendingToCompras}
              isPendingRecepcionSinCargo={!!meta?.isPendingRecepcionSinCargo}
              isDeletingRequisicion={!!meta?.isDeletingRequisicion}
            />
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
