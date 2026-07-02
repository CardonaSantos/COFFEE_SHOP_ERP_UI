import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RegistroCajaResponse } from "../interfaces/registroscajas.interfaces";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  X,
  FileText,
} from "lucide-react";
import { columnas } from "./Columnas";
import { toast } from "sonner";
import {
  ReporteCajaMonetarioQuery,
  useGetReportCajas,
  useGetReportCajasRango,
} from "@/hooks/use-cajas/use-cajas";
import { getApiErrorMessageAxios } from "@/Pages/Utils/UtilsErrorApi";
import { downloadFile } from "@/hooks/use-reports/use-report-excel";
import useGetSucursales from "@/hooks/getSucursales/use-sucursales";
import { useGetUsersSelect } from "@/hooks/use-users/use-users";

type PropsCajasTable = {
  data: RegistroCajaResponse[];
  page: number;
  limit: number;
  pages: number;
  total: number;
  loading?: boolean;
  onChangePage: (p: number) => void;
  onChangeLimit: (l: number) => void;
};

const tableVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.05,
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.15 },
  },
};

function Table({
  data,
  limit,
  onChangeLimit,
  onChangePage,
  page,
  pages,
  total,
  loading,
}: PropsCajasTable) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const { data: sucursales = [] } = useGetSucursales();

  const { data: usuarios = [] } = useGetUsersSelect();

  const [queryReportRange, setQueryReportRange] =
    useState<ReporteCajaMonetarioQuery>({
      incluirMovimientos: "true",
    });

  const [rangePreset, setRangePreset] = useState<
    "HOY" | "AYER" | "SEMANA" | "MES" | "CUSTOM"
  >("HOY");

  const setReportFilter = <K extends keyof ReporteCajaMonetarioQuery>(
    key: K,
    value: ReporteCajaMonetarioQuery[K] | "",
  ) => {
    setQueryReportRange((prev) => {
      const next = {
        ...(prev ?? {}),
      };

      if (value === "" || value === undefined || value === null) {
        delete next[key];
      } else {
        next[key] = value as ReporteCajaMonetarioQuery[K];
      }

      return next;
    });
  };

  const reportFiltersCount = Object.entries(queryReportRange ?? {}).filter(
    ([key, value]) => {
      if (key === "incluirMovimientos") return value === "false";
      return value !== undefined && value !== null && value !== "";
    },
  ).length;

  const setNumberReportFilter = (
    key: "sucursalId" | "usuarioId" | "cuentaBancariaId",
    value: string,
  ) => {
    if (!value) {
      setReportFilter(key, "");
      return;
    }

    setReportFilter(key, Number(value));
  };

  const clearReportFilters = () => {
    setRangePreset("HOY");
    setQueryReportRange({
      incluirMovimientos: "true",
    });
  };

  const getReportByRange = useGetReportCajasRango();

  const [cajasIds, setCajasIds] = useState<Array<number>>([]);

  const toInputDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const applyRangePreset = (
    preset: "HOY" | "AYER" | "SEMANA" | "MES" | "CUSTOM",
  ) => {
    setRangePreset(preset);

    const now = new Date();

    if (preset === "CUSTOM") return;

    if (preset === "HOY") {
      const today = toInputDate(now);

      setQueryReportRange((prev) => ({
        ...(prev ?? {}),
        from: today,
        to: today,
      }));

      return;
    }

    if (preset === "AYER") {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);

      const date = toInputDate(yesterday);

      setQueryReportRange((prev) => ({
        ...(prev ?? {}),
        from: date,
        to: date,
      }));

      return;
    }

    if (preset === "SEMANA") {
      const from = new Date(now);
      from.setDate(now.getDate() - 6);

      setQueryReportRange((prev) => ({
        ...(prev ?? {}),
        from: toInputDate(from),
        to: toInputDate(now),
      }));

      return;
    }

    if (preset === "MES") {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);

      setQueryReportRange((prev) => ({
        ...(prev ?? {}),
        from: toInputDate(from),
        to: toInputDate(now),
      }));
    }
  };

  const handleSetCajaId = (id: number) => {
    setCajasIds((previa) =>
      previa.includes(id)
        ? previa.filter((item) => item !== id)
        : [...previa, id],
    );
  };
  const getReport = useGetReportCajas();

  const [globalFilter, setGlobalFilter] = React.useState("");
  const [showFilters, setShowFilters] = React.useState(false);

  const table = useReactTable<RegistroCajaResponse>({
    data,
    columns: columnas,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination: {
        pageIndex: Math.max(0, page - 1),
        pageSize: limit,
      },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex: Math.max(0, page - 1), pageSize: limit })
          : updater;

      if (next.pageSize !== limit) onChangeLimit(next.pageSize);
      if (next.pageIndex !== Math.max(0, page - 1))
        onChangePage(next.pageIndex + 1);
    },

    manualPagination: true,
    pageCount: pages,

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),

    meta: {
      onToggleCaja: handleSetCajaId,
      cajasIds: cajasIds,
    },
  });

  const activeFiltersCount = columnFilters.length + (globalFilter ? 1 : 0);

  const clearAllFilters = () => {
    setGlobalFilter("");
    setColumnFilters([]);
  };

  const handleDownloadReport = async () => {
    console.log("Clickeo");

    toast.promise(
      getReport.mutateAsync({
        ids: cajasIds,
      }),
      {
        success: (data: any) => {
          downloadFile(data, `Cajas_reporte_${Date.now()}.xlsx`);
          return "Reporte Generado";
        },
        error: (error) => getApiErrorMessageAxios(error),
        loading: "Generando reporte...",
      },
    );
  };

  const handleDownloadReportByRange = async () => {
    toast.promise(getReportByRange.mutateAsync(queryReportRange), {
      success: (data: any) => {
        downloadFile(data, `Reporte_cajas_rango_${Date.now()}.xlsx`);
        return "Reporte por rango generado";
      },
      error: (error) => getApiErrorMessageAxios(error),
      loading: "Generando reporte por rango...",
    });
  };

  return (
    <div className="space-y-3">
      <Card className="border rounded-md overflow-hidden">
        <CardHeader className="py-2 px-3">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            {/* IZQUIERDA */}
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <CardTitle className="text-sm font-medium truncate">
                Registros de Caja
              </CardTitle>

              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {table.getFilteredRowModel().rows.length}
              </Badge>

              {cajasIds.length > 0 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {cajasIds.length} sel.
                </Badge>
              )}

              {reportFiltersCount > 0 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {reportFiltersCount} filtros reporte
                </Badge>
              )}
            </div>

            {/* DERECHA */}
            <div className="flex items-center gap-1 flex-wrap lg:flex-nowrap">
              {/* Buscar tabla */}
              <div className="relative flex-1 min-w-[150px] sm:flex-none">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="Buscar"
                  value={globalFilter ?? ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-6 h-7 text-xs w-full sm:w-[180px]"
                />
              </div>

              {/* Mostrar filtros */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-7 px-2 text-xs flex items-center gap-1"
              >
                <Filter className="h-3 w-3" />
                <span className="hidden sm:inline">Filtros</span>
                {activeFiltersCount + reportFiltersCount > 0 && (
                  <span className="text-[10px]">
                    ({activeFiltersCount + reportFiltersCount})
                  </span>
                )}
              </Button>

              {/* Limpiar filtros tabla */}
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-7 px-2 text-xs flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  <span className="hidden sm:inline">Tabla</span>
                </Button>
              )}

              {/* Reporte por selección */}
              <Button
                size="sm"
                onClick={handleDownloadReport}
                disabled={getReport.isPending || cajasIds.length === 0}
                className="h-7 px-2 text-xs flex items-center gap-1"
              >
                <FileText className="h-3 w-3" />
                <span className="hidden sm:inline">Sel.</span>
              </Button>

              {/* Reporte por rango */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadReportByRange}
                disabled={getReportByRange.isPending}
                className="h-7 px-2 text-xs flex items-center gap-1"
              >
                <FileText className="h-3 w-3" />
                <span className="hidden sm:inline">Rango</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        {showFilters && (
          <CardContent className="border-t bg-muted/20 p-3">
            <div className="space-y-3">
              {/* SECCIÓN: FECHAS */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    Rango del reporte
                  </h3>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearReportFilters}
                    className="h-6 px-2 text-[11px]"
                  >
                    Limpiar reporte
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground">
                      Rango rápido
                    </label>
                    <select
                      value={rangePreset}
                      onChange={(e) =>
                        applyRangePreset(
                          e.target.value as
                            | "HOY"
                            | "AYER"
                            | "SEMANA"
                            | "MES"
                            | "CUSTOM",
                        )
                      }
                      className="border rounded px-2 h-8 text-xs bg-background w-full"
                    >
                      <option value="HOY">Hoy</option>
                      <option value="AYER">Ayer</option>
                      <option value="SEMANA">Últimos 7 días</option>
                      <option value="MES">Este mes</option>
                      <option value="CUSTOM">Personalizado</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground">
                      Desde
                    </label>
                    <Input
                      type="date"
                      value={queryReportRange?.from ?? ""}
                      onChange={(e) => {
                        setRangePreset("CUSTOM");
                        setReportFilter("from", e.target.value);
                      }}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground">
                      Hasta
                    </label>
                    <Input
                      type="date"
                      value={queryReportRange?.to ?? ""}
                      onChange={(e) => {
                        setRangePreset("CUSTOM");
                        setReportFilter("to", e.target.value);
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* SECCIÓN: FILTROS OPERATIVOS */}
              <div className="space-y-1.5">
                <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                  Filtros operativos
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground">
                      Estado caja
                    </label>
                    <select
                      value={queryReportRange?.estadoCaja ?? ""}
                      onChange={(e) =>
                        setReportFilter("estadoCaja", e.target.value)
                      }
                      className="border rounded px-2 h-8 text-xs bg-background w-full"
                    >
                      <option value="">Todos</option>
                      <option value="ABIERTA">Abierta</option>
                      <option value="CERRADA">Cerrada</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground">
                      Método pago
                    </label>
                    <select
                      value={queryReportRange?.metodoPago ?? ""}
                      onChange={(e) =>
                        setReportFilter("metodoPago", e.target.value)
                      }
                      className="border rounded px-2 h-8 text-xs bg-background w-full"
                    >
                      <option value="">Todos</option>
                      <option value="EFECTIVO">Efectivo</option>
                      <option value="TRANSFERENCIA">Transferencia</option>
                      <option value="TARJETA">Tarjeta</option>
                      <option value="BANCO">Banco</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground">
                      Clasificación
                    </label>
                    <select
                      value={queryReportRange?.clasificacion ?? ""}
                      onChange={(e) =>
                        setReportFilter("clasificacion", e.target.value)
                      }
                      className="border rounded px-2 h-8 text-xs bg-background w-full"
                    >
                      <option value="">Todas</option>
                      <option value="INGRESO">Ingreso</option>
                      <option value="EGRESO">Egreso</option>
                      <option value="TRANSFERENCIA">Transferencia</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground">
                      Sucursal
                    </label>
                    <select
                      value={queryReportRange?.sucursalId ?? ""}
                      onChange={(e) =>
                        setNumberReportFilter("sucursalId", e.target.value)
                      }
                      className="border rounded px-2 h-8 text-xs bg-background w-full"
                    >
                      <option value="">Todas</option>
                      {sucursales?.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground">
                      Usuario
                    </label>
                    <select
                      value={queryReportRange?.usuarioId ?? ""}
                      onChange={(e) =>
                        setNumberReportFilter("usuarioId", e.target.value)
                      }
                      className="border rounded px-2 h-8 text-xs bg-background w-full"
                    >
                      <option value="">Todos</option>
                      {usuarios?.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECCIÓN: OPCIONES */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t pt-2">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={queryReportRange?.incluirMovimientos !== "false"}
                    onChange={(e) =>
                      setReportFilter(
                        "incluirMovimientos",
                        e.target.checked ? "true" : "false",
                      )
                    }
                  />
                  Incluir movimientos detallados
                </label>

                <div className="flex items-center gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearReportFilters}
                    className="h-8 px-2 text-xs"
                  >
                    Limpiar
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleDownloadReportByRange}
                    disabled={getReportByRange.isPending}
                    className="h-8 px-2 text-xs flex items-center gap-1"
                  >
                    <FileText className="h-3 w-3" />
                    Generar rango
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Tabla ultra compacta */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <motion.table className="w-full text-xs" variants={tableVariants}>
              <thead className="bg-muted/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="text-left py-2 px-2 font-medium cursor-pointer select-none hover:bg-muted/80 transition-colors text-xs"
                        style={{ width: header.getSize() }}
                      >
                        <div className="flex items-center gap-1">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          <div className="flex flex-col">
                            {{
                              asc: (
                                <span className="text-primary text-xs">↑</span>
                              ),
                              desc: (
                                <span className="text-primary text-xs">↓</span>
                              ),
                            }[header.column.getIsSorted() as string] ?? (
                              <span className="text-muted-foreground opacity-50 text-xs">
                                ↕
                              </span>
                            )}
                          </div>
                        </div>

                        <AnimatePresence>
                          {showFilters && header.column.getCanFilter() && (
                            <motion.div
                              className="mt-1"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Input
                                value={
                                  (header.column.getFilterValue() as string) ??
                                  ""
                                }
                                onChange={(e) =>
                                  header.column.setFilterValue(e.target.value)
                                }
                                placeholder="Filtrar..."
                                className="h-6 text-xs"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {table.getRowModel().rows.map((row, index) => (
                    <motion.tr
                      key={row.id}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      className="border-b hover:bg-muted/50 transition-colors"
                      style={{ animationDelay: `${index * 0.03}s` }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="py-1.5 px-2"
                          style={{ width: cell.column.getSize() }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </motion.table>
          </div>

          {table.getRowModel().rows.length === 0 && (
            <motion.div
              className="text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-muted-foreground">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-sm font-medium">
                  No se encontraron registros
                </div>
                <div className="text-xs">
                  {globalFilter || columnFilters.length > 0
                    ? "Intenta ajustar los filtros"
                    : "No hay registros disponibles"}
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Paginación compacta */}
      {table.getRowModel().rows.length > 0 && (
        <Card>
          <CardContent className="py-2">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  {table.getState().pagination.pageIndex *
                    table.getState().pagination.pageSize +
                    1}
                  -
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) *
                      table.getState().pagination.pageSize,
                    table.getFilteredRowModel().rows.length,
                  )}{" "}
                  de {table.getFilteredRowModel().rows.length}
                </span>
              </div>
              {/* Paginación compacta */}
              {data.length > 0 && (
                <Card>
                  <CardContent className="py-2">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {total === 0 ? "0-0" : (page - 1) * limit + 1} -{" "}
                          {Math.min(page * limit, total)} de {total}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="flex items-center gap-0.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onChangePage(1)}
                            disabled={page <= 1 || loading}
                            className="h-7 w-7 p-0"
                          >
                            <ChevronsLeft className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onChangePage(page - 1)}
                            disabled={page <= 1 || loading}
                            className="h-7 w-7 p-0"
                          >
                            <ChevronLeft className="h-3 w-3" />
                          </Button>
                          <div className="flex items-center gap-1 mx-2">
                            <span className="text-xs">Pág.</span>
                            <Badge variant="outline" className="text-xs px-1">
                              {page}/{Math.max(1, pages)}
                            </Badge>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onChangePage(page + 1)}
                            disabled={page >= pages || loading}
                            className="h-7 w-7 p-0"
                          >
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onChangePage(pages)}
                            disabled={page >= pages || loading}
                            className="h-7 w-7 p-0"
                          >
                            <ChevronsRight className="h-3 w-3" />
                          </Button>
                        </div>

                        <select
                          className="border rounded px-1 py-0.5 text-xs bg-background h-7"
                          value={limit}
                          onChange={(e) =>
                            onChangeLimit(Number(e.target.value))
                          }
                          disabled={loading}
                        >
                          {[5, 10, 15, 25, 50].map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Table;
