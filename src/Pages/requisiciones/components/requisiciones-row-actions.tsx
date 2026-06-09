"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Eye,
  Printer,
  ShoppingCart,
  Pencil,
  Trash2,
  PackageCheck,
  Loader2,
} from "lucide-react";
import {
  getReqFlags,
  RequisitionResponseDTO,
} from "@/Types/requisiciones/requisiciones-tables";
import { Link } from "react-router-dom";

interface RequisitionRowActionsProps {
  requisicion: RequisitionResponseDTO;
  onVerDetalle: (req: RequisitionResponseDTO) => void;
  onImprimir: (req: RequisitionResponseDTO) => void;
  onSendToCompras: (req: RequisitionResponseDTO) => void;
  onRecepcionSinCargo: (req: RequisitionResponseDTO) => void;
  onDelete?: (req: RequisitionResponseDTO) => void;

  isSendingToCompras?: boolean;
  isPendingRecepcionSinCargo?: boolean;
  isDeletingRequisicion?: boolean;
}

export function RequisitionRowActions({
  requisicion,
  onVerDetalle,
  onImprimir,
  onSendToCompras,
  onRecepcionSinCargo,
  onDelete,
  isSendingToCompras = false,
  isPendingRecepcionSinCargo = false,
  isDeletingRequisicion = false,
}: RequisitionRowActionsProps) {
  const { canEdit, canSendToCompras, isEnviadaCompras } =
    getReqFlags(requisicion);

  const isBusy =
    isSendingToCompras || isPendingRecepcionSinCargo || isDeletingRequisicion;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          aria-label="Abrir menú de acciones"
          disabled={isBusy}
        >
          {isBusy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreVertical className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={() => onVerDetalle(requisicion)}>
          <Eye className="h-4 w-4 mr-2" />
          Ver detalle
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onImprimir(requisicion)}>
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {canEdit ? (
          <DropdownMenuItem asChild>
            <Link to={`/requisicion-edit/${requisicion.id}`}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar registro
            </Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem disabled>
            <Pencil className="h-4 w-4 mr-2" />
            Editar registro
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          disabled={!canSendToCompras || isEnviadaCompras || isSendingToCompras}
          onClick={() => {
            if (!canSendToCompras || isEnviadaCompras || isSendingToCompras) {
              return;
            }

            onSendToCompras(requisicion);
          }}
        >
          {isSendingToCompras ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <ShoppingCart className="h-4 w-4 mr-2" />
          )}
          {isEnviadaCompras ? "Ya en compras" : "Enviar a compras"}
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled={
            !canSendToCompras || isEnviadaCompras || isPendingRecepcionSinCargo
          }
          onClick={() => {
            if (
              !canSendToCompras ||
              isEnviadaCompras ||
              isPendingRecepcionSinCargo
            ) {
              return;
            }

            onRecepcionSinCargo(requisicion);
          }}
        >
          {isPendingRecepcionSinCargo ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <PackageCheck className="h-4 w-4 mr-2" />
          )}
          Enviar sin gasto
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          disabled={isDeletingRequisicion}
          className="text-destructive focus:text-destructive"
          onClick={() => onDelete?.(requisicion)}
        >
          {isDeletingRequisicion ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 mr-2" />
          )}
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
