import { useDeferredValue, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useStore } from "@/components/Context/ContextSucursal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/Transition/layout-transition";

import {
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  TrendingUp,
  X,
} from "lucide-react";

import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import dayjs from "dayjs";

import { formattMonedaGT } from "@/utils/formattMoneda";
import {
  PaginationMeta,
  TipoComprobante,
  VentaResumen,
  VentasApiResponse,
} from "./interfaces/VentasHistorialResponse";

import TableVentas from "./table/TableVentas";
import VentaDetalleDialog from "../POS/VentaDetalleDialog";
import { AdvancedDialog } from "@/utils/components/AdvancedDialog";

import {
  useApiMutation,
  useApiQuery,
} from "@/hooks/genericoCall/genericoCallHook";

import { ventasHistorialKeys } from "./Keys/query";
import { getApiErrorMessageAxios } from "../Utils/UtilsErrorApi";

import {
  downloadFile,
  useReportUtilidad,
  useReportVentas,
  UtilidadReportQuery,
} from "@/hooks/use-reports/use-report-excel";

registerLocale("es", es);

type QueryVentasUI = {
  page: number;
  limit: number;
  sortBy: "fechaVenta" | "totalVenta" | "clienteNombre";
  sortDir: "asc" | "desc";
  sucursalId: number;
  texto?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  montoMin?: number;
  montoMax?: number;
  tipoComprobante?: TipoComprobante[];
  isVendedor: boolean;
  usuarioId?: number;
  metodoPago?: string[];
};

type DeleteVentaState = {
  venta: VentaResumen | null;
  motivo: string;
  adminPassword: string;
};

type DeleteVentaPayload = {
  usuarioId: number;
  motivo: string;
  ventaId: number;
  sucursalId: number;
  productos: {
    cantidad: number;
    precioVenta: number;
    type: "PRODUCTO" | "PRESENTACION";
    productoId?: number;
    presentacionId?: number;
  }[];
  totalVenta: number;
  adminPassword: string;
};

const defaultMeta: PaginationMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
  sortBy: "fechaVenta",
  sortDir: "desc",
};

const initialDeleteState: DeleteVentaState = {
  venta: null,
  motivo: "",
  adminPassword: "",
};

const metodosPagoOptions = [
  { value: "EFECTIVO", label: "Contado" },
  { value: "TARJETA", label: "Tarjeta" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "CREDITO", label: "Crédito" },
  { value: "OTRO", label: "Otro" },
];

const comprobantesOptions = [
  { value: "RECIBO", label: "Recibo" },
  { value: "FACTURA", label: "Factura" },
];

const privilegedRoles = ["ADMIN", "SUPER_ADMIN", "MANAGER"];

function isPrivilegedRole(rol: string) {
  return privilegedRoles.includes(rol);
}

function buildDeletePayload(params: {
  venta: VentaResumen;
  usuarioId: number;
  sucursalId: number;
  motivo: string;
  adminPassword: string;
}): DeleteVentaPayload {
  const { venta, usuarioId, sucursalId, motivo, adminPassword } = params;

  const productos = (venta.items ?? []).map((item) => ({
    cantidad: item.cantidad,
    precioVenta: item.precioVenta,
    type: item.type,
    productoId: item.type === "PRODUCTO" ? item.productoId : undefined,
    presentacionId:
      item.type === "PRESENTACION" ? item.presentacionId : undefined,
  }));

  return {
    usuarioId,
    motivo: motivo.trim(),
    totalVenta: venta.total,
    productos,
    ventaId: venta.id,
    sucursalId,
    adminPassword,
  };
}

function MultiChecks({
  label,
  options,
  values,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  values: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="rounded-md border p-2">
      <div className="mb-1 text-xs font-medium">{label}</div>

      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const checked = values.includes(option.value);

          return (
            <label
              key={option.value}
              className="inline-flex cursor-pointer items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                className="accent-primary"
                checked={checked}
                onChange={() => {
                  const next = checked
                    ? values.filter((value) => value !== option.value)
                    : [...values, option.value];

                  onChange(next);
                }}
              />

              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function DeleteVentaDialog({
  open,
  state,
  isPending,
  onOpenChange,
  onChangeState,
  onConfirm,
}: {
  open: boolean;
  state: DeleteVentaState;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onChangeState: React.Dispatch<React.SetStateAction<DeleteVentaState>>;
  onConfirm: () => void;
}) {
  const venta = state.venta;

  return (
    <AdvancedDialog
      type="warning"
      open={open}
      onOpenChange={onOpenChange}
      title="Eliminación de venta"
      description="Se procederá a eliminar esta venta y los registros ligados a ella."
      question="¿Estás seguro de ello?"
      confirmButton={{
        label: "Sí, continuar y eliminar",
        onClick: onConfirm,
        loading: isPending,
        loadingText: "Eliminando registro...",
        disabled: isPending || !venta,
      }}
      cancelButton={{
        label: "Cancelar",
        onClick: () => onOpenChange(false),
        disabled: isPending,
        loadingText: "Cancelando...",
      }}
    >
      <div className="space-y-3">
        {venta ? (
          <div className="rounded-md border bg-muted/40 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Venta #{venta.id}</Badge>

              <span className="text-muted-foreground">
                {venta.clienteNombre ?? "CF"}
              </span>

              <span className="ml-auto font-semibold">
                {formattMonedaGT(venta.total)}
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            No se pudo identificar la venta seleccionada.
          </div>
        )}

        <Textarea
          placeholder="Motivo de la eliminación"
          value={state.motivo}
          disabled={isPending}
          onChange={(event) =>
            onChangeState((prev) => ({
              ...prev,
              motivo: event.target.value,
            }))
          }
        />

        <Input
          type="password"
          placeholder="Contraseña de administrador"
          value={state.adminPassword}
          disabled={isPending}
          onChange={(event) =>
            onChangeState((prev) => ({
              ...prev,
              adminPassword: event.target.value,
            }))
          }
        />
      </div>
    </AdvancedDialog>
  );
}

function PaginationControls({
  meta,
  onChangePage,
}: {
  meta: PaginationMeta;
  onChangePage: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChangePage(1)}
        disabled={!meta.hasPrev}
      >
        Primero
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onChangePage(Math.max(1, meta.page - 1))}
        disabled={!meta.hasPrev}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <span className="text-sm">
        Página <b>{meta.page}</b> de <b>{meta.totalPages || 1}</b>
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          onChangePage(Math.min(meta.totalPages || 1, meta.page + 1))
        }
        disabled={!meta.hasNext}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onChangePage(meta.totalPages || 1)}
        disabled={!meta.hasNext}
      >
        Último
      </Button>
    </div>
  );
}

export default function HistorialVentasMain() {
  const queryClient = useQueryClient();

  const sucursalId = useStore((state) => state.sucursalId) ?? 0;
  const userId = useStore((state) => state.userId) ?? 0;
  const rol = useStore((state) => state.userRol) ?? "";

  const reporteUtilidadMutation = useReportUtilidad();
  const reporteVentasMutation = useReportVentas();

  const [texto, setTexto] = useState("");
  const [fechaDesde, setFechaDesde] = useState<Date | null>(null);
  const [fechaHasta, setFechaHasta] = useState<Date | null>(null);
  const [montoMin, setMontoMin] = useState("");
  const [montoMax, setMontoMax] = useState("");
  const [metodosPago, setMetodosPago] = useState<string[]>([]);
  const [comprobantes, setComprobantes] = useState<string[]>([]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState<QueryVentasUI["sortBy"]>("fechaVenta");
  const [sortDir, setSortDir] = useState<QueryVentasUI["sortDir"]>("desc");

  const [isOpenDetalle, setIsOpenDetalle] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] =
    useState<VentaResumen | null>(null);

  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [deleteState, setDeleteState] =
    useState<DeleteVentaState>(initialDeleteState);

  const textoDeferred = useDeferredValue(texto);

  const shouldFilterBySeller = Boolean(rol) && !isPrivilegedRole(rol);

  const queryParams: QueryVentasUI = useMemo(
    () => ({
      page,
      limit,
      sortBy,
      sortDir,
      sucursalId,
      texto: textoDeferred || undefined,
      fechaDesde: fechaDesde
        ? dayjs(fechaDesde).format("YYYY-MM-DD")
        : undefined,
      fechaHasta: fechaHasta
        ? dayjs(fechaHasta).format("YYYY-MM-DD")
        : undefined,
      montoMin: montoMin ? Number(montoMin) : undefined,
      montoMax: montoMax ? Number(montoMax) : undefined,
      tipoComprobante: comprobantes.length
        ? (comprobantes as TipoComprobante[])
        : undefined,
      metodoPago: metodosPago.length ? metodosPago : undefined,

      // Esto solo filtra la consulta. No controla si puede eliminar.
      isVendedor: shouldFilterBySeller,
      usuarioId: shouldFilterBySeller ? userId : undefined,
    }),
    [
      page,
      limit,
      sortBy,
      sortDir,
      sucursalId,
      textoDeferred,
      fechaDesde,
      fechaHasta,
      montoMin,
      montoMax,
      comprobantes,
      metodosPago,
      shouldFilterBySeller,
      userId,
    ],
  );

  const {
    data: ventasPage,
    isFetching,
    isError,
  } = useApiQuery<VentasApiResponse>(
    ventasHistorialKeys.listSucursal(sucursalId, queryParams),
    `/venta/find-my-sucursal-sales/${sucursalId}`,
    { params: queryParams },
    {
      enabled: Number.isFinite(sucursalId) && sucursalId > 0,
      staleTime: 0,
      refetchOnMount: "always",
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    },
  );

  const deleteMutation = useApiMutation<any, DeleteVentaPayload>(
    "post",
    "/sale-deleted",
    undefined,
    {
      onSuccess: () => {
        closeDeleteDialog();
        queryClient.invalidateQueries({ queryKey: ventasHistorialKeys.all });
      },
    },
  );

  const meta = ventasPage?.meta ?? defaultMeta;

  const totalVentas = useMemo(() => {
    const total =
      ventasPage?.data.reduce((acc, venta) => acc + venta.total, 0) ?? 0;

    return formattMonedaGT(total);
  }, [ventasPage]);

  function resetFilters() {
    setTexto("");
    setFechaDesde(null);
    setFechaHasta(null);
    setMontoMin("");
    setMontoMax("");
    setMetodosPago([]);
    setComprobantes([]);
    setSortBy("fechaVenta");
    setSortDir("desc");
    setPage(1);
  }

  function closeDeleteDialog() {
    setIsOpenDelete(false);
    setDeleteState(initialDeleteState);
  }

  function handleDeleteOpenChange(nextOpen: boolean) {
    if (deleteMutation.isPending) return;

    if (!nextOpen) {
      closeDeleteDialog();
      return;
    }

    setIsOpenDelete(true);
  }

  function handleChangeLimit(nextLimit: number) {
    setLimit(nextLimit);
    setPage(1);
  }

  function handleSortChange(
    by: PaginationMeta["sortBy"],
    dir: PaginationMeta["sortDir"],
  ) {
    setSortBy(by as QueryVentasUI["sortBy"]);
    setSortDir(dir as QueryVentasUI["sortDir"]);
    setPage(1);
  }

  function handleViewVenta(venta: VentaResumen) {
    if (!venta?.id) {
      toast.error("No se pudo identificar la venta.");
      return;
    }

    setVentaSeleccionada(venta);
    setIsOpenDetalle(true);
  }

  function handleAskDelete(venta: VentaResumen) {
    if (!venta?.id) {
      toast.error("No se pudo identificar la venta a eliminar.");
      return;
    }

    setDeleteState({
      venta,
      motivo: "",
      adminPassword: "",
    });

    setIsOpenDelete(true);
  }

  async function handleConfirmDelete() {
    const venta = deleteState.venta;

    if (!venta?.id) {
      toast.error("No hay una venta válida seleccionada.");
      return;
    }

    if (!userId) {
      toast.error("No se pudo identificar el usuario actual.");
      return;
    }

    if (!sucursalId) {
      toast.error("No se pudo identificar la sucursal actual.");
      return;
    }

    if (!deleteState.motivo.trim()) {
      toast.info("Ingrese el motivo de la eliminación.");
      return;
    }

    if (!deleteState.adminPassword) {
      toast.info("Ingrese la contraseña de administrador.");
      return;
    }

    const payload = buildDeletePayload({
      venta,
      usuarioId: userId,
      sucursalId,
      motivo: deleteState.motivo,
      adminPassword: deleteState.adminPassword,
    });

    await toast.promise(deleteMutation.mutateAsync(payload), {
      loading: "Eliminando registro...",
      success: "Venta eliminada",
      error: (error) => getApiErrorMessageAxios(error),
    });
  }

  function handleGenerarReporte() {
    const dto: UtilidadReportQuery = {
      fechaFin: fechaHasta,
      fechaInicio: fechaDesde,
      comprobantes,
      metodosPago,
      montoMax,
      montoMin,
    };

    reporteVentasMutation.mutateAsync(dto, {
      onSuccess: (data: any) => {
        downloadFile(data, `Historial_Ventas_${Date.now()}.xlsx`);
        toast.success("Reporte de ventas descargado");
      },
      onError: (error) => {
        toast.error(getApiErrorMessageAxios(error));
      },
    });
  }

  function handleGenerarReporteUtilidad() {
    const dto: UtilidadReportQuery = {
      fechaFin: fechaHasta,
      fechaInicio: fechaDesde,
      comprobantes,
      metodosPago,
      montoMax,
      montoMin,
    };

    reporteUtilidadMutation.mutateAsync(dto, {
      onSuccess: (data: any) => {
        downloadFile(data, `Utilidad_Reporte_${Date.now()}.xlsx`);
        toast.success("Reporte de utilidad descargado");
      },
      onError: (error) => {
        toast.error(getApiErrorMessageAxios(error));
      },
    });
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-destructive">
        Error al cargar ventas.
      </div>
    );
  }

  if (!ventasPage) {
    return (
      <div className="p-6 text-center text-muted-foreground">No hay datos.</div>
    );
  }

  return (
    <PageTransition fallbackBackTo="/" titleHeader="Historial de Ventas">
      <Card className="mb-4">
        <CardContent className="space-y-3 p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-muted-foreground">
                Texto
              </label>

              <Input
                value={texto}
                onChange={(event) => {
                  setTexto(event.target.value);
                  setPage(1);
                }}
                placeholder="Buscar cliente, referencia, código, etc."
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Desde
              </label>

              <DatePicker
                locale="es"
                selected={fechaDesde}
                onChange={(date) => {
                  setFechaDesde(date as Date | null);
                  setPage(1);
                }}
                isClearable
                placeholderText="Inicio"
                className="w-full rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Hasta
              </label>

              <DatePicker
                locale="es"
                selected={fechaHasta}
                onChange={(date) => {
                  setFechaHasta(date as Date | null);
                  setPage(1);
                }}
                isClearable
                placeholderText="Fin"
                className="w-full rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Monto mínimo
              </label>

              <Input
                inputMode="decimal"
                value={montoMin}
                onChange={(event) => {
                  setMontoMin(event.target.value);
                  setPage(1);
                }}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Monto máximo
              </label>

              <Input
                inputMode="decimal"
                value={montoMax}
                onChange={(event) => {
                  setMontoMax(event.target.value);
                  setPage(1);
                }}
                placeholder="9999.00"
              />
            </div>

            <MultiChecks
              label="Método de pago"
              options={metodosPagoOptions}
              values={metodosPago}
              onChange={(values) => {
                setMetodosPago(values);
                setPage(1);
              }}
            />

            <MultiChecks
              label="Comprobante"
              options={comprobantesOptions}
              values={comprobantes}
              onChange={(values) => {
                setComprobantes(values);
                setPage(1);
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-1">
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <X className="mr-1 h-3.5 w-3.5" />
              Limpiar
            </Button>

            <div className="flex items-center gap-1.5 rounded-md border border-dashed border-border bg-muted/50 px-2.5 py-1">
              <span className="text-xs">Total:</span>
              <span className="text-sm font-semibold">{totalVentas}</span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleGenerarReporte}
              >
                <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />
                Ventas
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handleGenerarReporteUtilidad}
              >
                <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
                Utilidad
              </Button>

              <div className="flex items-center gap-1.5 border-l pl-2">
                <span className="text-xs text-muted-foreground">Límite</span>

                <select
                  className="h-8 rounded-md border bg-background px-2 text-sm"
                  value={limit}
                  onChange={(event) =>
                    handleChangeLimit(Number(event.target.value))
                  }
                >
                  {[10, 20, 25, 50, 100].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <TableVentas
        pageData={ventasPage}
        isLoading={isFetching}
        onSortChange={handleSortChange}
        onViewVenta={handleViewVenta}
        onDeleteVenta={handleAskDelete}
      />

      <VentaDetalleDialog
        open={isOpenDetalle}
        onOpenChange={setIsOpenDetalle}
        venta={ventaSeleccionada as any}
        onDeleteClick={handleAskDelete}
      />

      <PaginationControls meta={meta} onChangePage={setPage} />

      <DeleteVentaDialog
        open={isOpenDelete}
        state={deleteState}
        isPending={deleteMutation.isPending}
        onOpenChange={handleDeleteOpenChange}
        onChangeState={setDeleteState}
        onConfirm={handleConfirmDelete}
      />
    </PageTransition>
  );
}
