"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  TableMeta,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Loader2,
  Package,
  Hash,
  Barcode,
  Layers3,
  TriangleAlert,
  RefreshCw,
  PackageCheck,
} from "lucide-react";
import {
  getEstadoBadgeVariant,
  RequisitionLineDTO,
  RequisitionResponseDTO,
  SendToComprasDTO,
} from "@/Types/requisiciones/requisiciones-tables";
import { ProveedorOption, SendToPurchasesDialog } from "./send-to-purchase";
import { requisicionColumns, RequisitionTableMeta } from "../columns/columns";
import { PresupuestoPartidaSelect } from "@/Types/costos presupuestales/selects";
import { formattFecha } from "@/Pages/Utils/Utils";
import { formattMonedaGT } from "@/utils/formattMoneda";
import { CreateCompraSinCargoFromRequisicionDto } from "@/hooks/use-requisiciones/use-requisiciones";
import { AdvancedDialogERP } from "@/utils/components/dialog/advanced-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ============================================================
// Sub-component: InfoRow
// ============================================================

function InfoRow({
  label,
  children,
  bold = false,
}: {
  label: string;
  children: React.ReactNode;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-bold" : "font-medium"}>{children}</span>
    </div>
  );
}

// ============================================================
// Props
// ============================================================

interface RequisitionsTableProps {
  // ── Data
  data: RequisitionResponseDTO[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRefetch: () => void;

  userId: number;
  // ── Dialog dependencies
  proveedores: ProveedorOption[];
  partidas: PresupuestoPartidaSelect[];

  // ── Mutations (manejadas en el nivel superior)
  isSendingToCompras: boolean;
  isDeletingRequisicion: boolean;
  onSendToCompras: (dto: SendToComprasDTO) => void;

  handleRecepcionSinCargo: (
    dto: CreateCompraSinCargoFromRequisicionDto,
  ) => Promise<void>;
  isPendingRecepcionSinCargo: boolean;

  onDeleteRequisicion: (id: number) => void;
}

// ============================================================
// Component
// ============================================================

export function RequisitionsTable({
  data,
  isLoading,
  isError,
  error,
  onRefetch,
  proveedores,
  partidas,
  isSendingToCompras,
  isDeletingRequisicion,
  onSendToCompras,
  onDeleteRequisicion,
  handleRecepcionSinCargo,
  isPendingRecepcionSinCargo,
}: RequisitionsTableProps) {
  const [sinCargoReq, setSinCargoReq] = useState<RequisitionResponseDTO | null>(
    null,
  );
  const [proveedorSinCargoId, setProveedorSinCargoId] = useState<string>("");
  const [observacionesSinCargo, setObservacionesSinCargo] = useState("");

  // ── Dialog state ────────────────────────────────────────────
  const [detailReq, setDetailReq] = useState<RequisitionResponseDTO | null>(
    null,
  );
  const [sendReq, setSendReq] = useState<RequisitionResponseDTO | null>(null);
  const [deleteReq, setDeleteReq] = useState<RequisitionResponseDTO | null>(
    null,
  );

  // ── Meta callbacks para columnas ────────────────────────────
  const columnMeta = useMemo<RequisitionTableMeta>(
    () => ({
      onVerDetalle: (req) => setDetailReq(req),
      onImprimir: (req) => {
        window.open(`/pdf-requisicion/${req.id}`, "_blank");
      },
      onSendToCompras: (req) => setSendReq(req),
      onRecepcionSinCargo: (req) => {
        setObservacionesSinCargo("");
        setProveedorSinCargoId("");
        setSinCargoReq(req);
      },
      onDeleteRequisicion: (req) => setDeleteReq(req),

      isSendingToCompras,
      isPendingRecepcionSinCargo,
      isDeletingRequisicion,
    }),
    [isSendingToCompras, isPendingRecepcionSinCargo, isDeletingRequisicion],
  );
  // ── TanStack Table ──────────────────────────────────────────
  const table = useReactTable({
    data,
    columns: requisicionColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
    meta: columnMeta as unknown as TableMeta<RequisitionResponseDTO>,
  });

  const handleConfirmRecepcionSinCargo = async () => {
    if (!sinCargoReq) return;

    await handleRecepcionSinCargo({
      requisicionID: sinCargoReq.id,
      userID: sinCargoReq.usuario.id,
      proveedorId: proveedorSinCargoId
        ? Number(proveedorSinCargoId)
        : undefined,
      sucursalId: sinCargoReq.sucursal.id,
      observaciones:
        observacionesSinCargo.trim() ||
        `Recepción sin gasto desde requisición ${sinCargoReq.folio}`,
    });

    setSinCargoReq(null);
    setObservacionesSinCargo("");
    setProveedorSinCargoId("");
  };

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalItems = data.length;
  const startItem = pageIndex * pageSize + 1;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalItems);

  // ── Handlers que delegan al padre ───────────────────────────
  const handleConfirmDelete = () => {
    if (!deleteReq) return;
    onDeleteRequisicion(deleteReq.id);
    setDeleteReq(null);
  };

  // ── Loading / Error / Empty guards ──────────────────────────
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">
            Cargando requisiciones...
          </span>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Error al cargar requisiciones
          </CardTitle>
          <CardDescription className="text-destructive text-xs">
            {(error as { message?: string })?.message ?? "Error desconocido"}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button size="sm" variant="outline" onClick={onRefetch}>
            Reintentar
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
          <FileText className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium">No hay requisiciones</p>
          <p className="text-xs text-muted-foreground">
            No se encontraron registros en el sistema.
          </p>
        </CardContent>
      </Card>
    );
  }

  // ── Render principal ────────────────────────────────────────
  return (
    <>
      <Card>
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              Requisiciones
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Total: {data.length} registros
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={onRefetch}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refrescar
          </Button>
        </CardHeader>

        {/* Tabla */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id} className="hover:bg-transparent">
                    {hg.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="text-xs h-8 px-3 font-medium"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="h-9">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-3 py-1.5">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* Paginación */}
        {table.getPageCount() > 1 && (
          <CardFooter className="flex items-center justify-between px-4 py-2 border-t gap-4">
            <p className="text-xs text-muted-foreground">
              {startItem}–{endItem} de {totalItems}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Anterior
              </Button>
              <span className="text-xs text-muted-foreground px-1">
                Pág. {pageIndex + 1} / {table.getPageCount()}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Siguiente
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* ── Dialog: Ver Detalle ─────────────────────────────── */}
      <Dialog open={!!detailReq} onOpenChange={(v) => !v && setDetailReq(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Requisición{detailReq?.folio ? ` — ${detailReq.folio}` : ""}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Información completa de la requisición y sus líneas
            </DialogDescription>
          </DialogHeader>

          {detailReq && (
            <ScrollArea className="max-h-[68vh] pr-1">
              <div className="space-y-4">
                {/* Info general + adicional */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Card className="shadow-none">
                    <CardHeader className="pb-2 pt-3 px-3">
                      <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Información general
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 space-y-2">
                      <InfoRow label="Folio:">{detailReq.folio}</InfoRow>
                      <InfoRow label="Fecha:">
                        {formattFecha(detailReq.fecha)}
                      </InfoRow>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Estado:</span>
                        <Badge
                          variant={getEstadoBadgeVariant(detailReq.estado)}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {detailReq.estado}
                        </Badge>
                      </div>
                      <InfoRow label="Total líneas:">
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {detailReq.totalLineas}
                        </Badge>
                      </InfoRow>
                    </CardContent>
                  </Card>

                  <Card className="shadow-none">
                    <CardHeader className="pb-2 pt-3 px-3">
                      <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Detalles adicionales
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 space-y-2">
                      <InfoRow label="Sucursal:">
                        {detailReq.sucursal.nombre}
                      </InfoRow>
                      <InfoRow label="Usuario:">
                        {detailReq.usuario.nombre}
                      </InfoRow>
                      <InfoRow label="Rol:">{detailReq.usuario.rol}</InfoRow>
                      <InfoRow label="Total:" bold>
                        {formattMonedaGT(detailReq.totalRequisicion)}
                      </InfoRow>
                    </CardContent>
                  </Card>
                </div>

                {/* Observaciones */}
                {detailReq.observaciones && (
                  <Card className="shadow-none">
                    <CardHeader className="pb-2 pt-3 px-3">
                      <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Observaciones
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-3">
                      <p className="text-xs text-muted-foreground">
                        {detailReq.observaciones}
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Separator />

                {/* Líneas */}
                <div>
                  <h3 className="text-xs font-semibold flex items-center gap-1.5 mb-3">
                    <Package className="h-3.5 w-3.5" />
                    Líneas de productos ({detailReq.lineas.length})
                  </h3>

                  <div className="space-y-2">
                    {detailReq.lineas.map((l: RequisitionLineDTO) => (
                      <Card
                        key={l.id}
                        className="shadow-none border-l-2 border-l-border"
                      >
                        <CardContent className="px-3 py-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Identidad */}
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-medium">
                                  {l.producto.nombre}
                                </span>
                                {l.esPresentacion && (
                                  <Badge
                                    variant="default"
                                    className="text-[9px] px-1 py-0"
                                  >
                                    <Layers3 className="h-2.5 w-2.5 mr-0.5" />
                                    Pres.
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Hash className="h-3 w-3" />
                                {l.producto.codigoProducto}
                              </p>
                              {l.esPresentacion && l.presentacion && (
                                <div className="text-[11px] text-muted-foreground space-y-0.5">
                                  <div className="flex items-center gap-1">
                                    <Package className="h-3 w-3" />
                                    {l.presentacion.nombre} (×
                                    {l.presentacion.factorUnidadBase})
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Barcode className="h-3 w-3" />
                                    SKU: {l.presentacion.sku ?? "—"}
                                  </div>
                                </div>
                              )}
                              {l.fechaExpiracion && (
                                <p className="text-[11px] text-muted-foreground">
                                  Vence: {formattFecha(l.fechaExpiracion)}
                                </p>
                              )}
                            </div>

                            {/* Cantidades */}
                            <div className="space-y-1.5">
                              <InfoRow label="Stock actual:">
                                {l.cantidadActual}
                              </InfoRow>
                              <InfoRow label="Stock mínimo:">
                                {l.stockMinimo}
                              </InfoRow>
                              <InfoRow label="Cant. sugerida:">
                                <span className="text-primary font-semibold">
                                  {l.cantidadSugerida}
                                </span>
                              </InfoRow>
                            </div>

                            {/* Precios */}
                            <div className="space-y-1.5">
                              <InfoRow label="Precio unitario:">
                                {formattMonedaGT(l.precioUnitario)}
                              </InfoRow>
                              <InfoRow label="Subtotal:" bold>
                                {formattMonedaGT(l.subtotal)}
                              </InfoRow>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Auditoría */}
                <Card className="shadow-none">
                  <CardHeader className="pb-2 pt-3 px-3">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Auditoría
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3 grid grid-cols-2 gap-2">
                    <InfoRow label="Creado:">
                      {formattFecha(detailReq.createdAt)}
                    </InfoRow>
                    <InfoRow label="Actualizado:">
                      {formattFecha(detailReq.updatedAt)}
                    </InfoRow>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Confirmar eliminar ──────────────────────── */}
      <Dialog open={!!deleteReq} onOpenChange={(v) => !v && setDeleteReq(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2">
              <TriangleAlert className="h-4 w-4 text-destructive" />
              Eliminar requisición
            </DialogTitle>
            <DialogDescription className="text-xs">
              Esta acción eliminará el registro{" "}
              <strong>{deleteReq?.folio}</strong> de forma permanente y no podrá
              revertirse.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteReq(null)}
              disabled={isDeletingRequisicion}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isDeletingRequisicion}
              onClick={handleConfirmDelete}
            >
              {isDeletingRequisicion ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Sí, eliminar"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AdvancedDialogERP
        showIcon={false}
        maxWidth="sm"
        contentCard={false}
        showDivider={false}
        iconAnimation={false}
        open={!!sinCargoReq}
        onOpenChange={(open) => {
          if (!open && !isPendingRecepcionSinCargo) {
            setSinCargoReq(null);
            setObservacionesSinCargo("");
            setProveedorSinCargoId("");
          }
        }}
        title="Enviar sin gasto"
        description={
          sinCargoReq
            ? `La requisición ${sinCargoReq.folio} se enviará a compras, se recepcionará automáticamente y entrará a stock sin generar pago.`
            : "Recepcionar requisición sin gasto."
        }
        confirmButton={{
          label: "Confirmar recepción",
          disabled: isPendingRecepcionSinCargo,
          onClick: handleConfirmRecepcionSinCargo,
        }}
        cancelButton={{
          label: "Cancelar",
          disabled: isPendingRecepcionSinCargo,
        }}
      >
        <div className="space-y-3">
          <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs">
            <div className="flex items-center gap-2 font-medium">
              <PackageCheck className="h-4 w-4" />
              Recepción sin gasto
            </div>

            <p className="mt-1 text-muted-foreground">
              Este flujo creará la compra como historial, recepcionará los
              productos y aumentará stock sin generar movimiento financiero.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Proveedor</Label>

            <Select
              value={proveedorSinCargoId}
              onValueChange={setProveedorSinCargoId}
              disabled={isPendingRecepcionSinCargo}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Seleccionar proveedor (opcional)" />
              </SelectTrigger>

              <SelectContent>
                {proveedores.map((proveedor) => (
                  <SelectItem
                    key={proveedor.id}
                    value={String(proveedor.id)}
                    className="text-xs"
                  >
                    {proveedor.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Observaciones</Label>

            <Textarea
              value={observacionesSinCargo}
              onChange={(e) => setObservacionesSinCargo(e.target.value)}
              placeholder="Observaciones (opcional)"
              disabled={isPendingRecepcionSinCargo}
              className="min-h-16 text-xs resize-none"
            />
          </div>
        </div>
      </AdvancedDialogERP>

      {/* ── Dialog: Enviar a compras ────────────────────────── */}
      <SendToPurchasesDialog
        open={!!sendReq}
        onOpenChange={(v) => !v && setSendReq(null)}
        requisicion={sendReq}
        proveedores={proveedores}
        partidas={partidas}
        isPending={isSendingToCompras}
        onConfirm={(dto) => {
          onSendToCompras(dto);
          setSendReq(null);
        }}
      />
    </>
  );
}
