"use client";

import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import { AnimatePresence, motion } from "framer-motion";
import { Search, ScanLine, Zap } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

import { columnsTablePos } from "./colums";
import { ReusableSelect } from "@/utils/components/ReactSelectComponent/ReusableSelect";
import { TipoPresentacion } from "@/Pages/newCreateProduct/interfaces/DomainProdPressTypes";
import { CategoriaWithCount } from "@/Pages/Categorias/CategoriasMainPage";
import { ProductoData } from "../interfaces/newProductsPOSResponse";
import type { NewQueryDTO } from "../interfaces/interfaces";
import { ProductoPOS } from "@/Types/POS/interfaces";

// ---------------------------------------------------------------------------
// Sub-tipos locales (no duplican los de pos.types.ts)
// ---------------------------------------------------------------------------

interface TablePOSProps {
  // Data
  data: ProductoData[];
  isLoadingProducts: boolean;

  // Search & filters
  searchValue: string;
  handleSearchItemsInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  queryOptions: NewQueryDTO;
  setQueryOptions: React.Dispatch<React.SetStateAction<NewQueryDTO>>;
  categorias: CategoriaWithCount[];
  tiposPresentacion: TipoPresentacion[];

  // Cart
  addToCart: (product: ProductoPOS) => void;
  defaultMapToCartProduct: (p: ProductoData) => ProductoPOS;
  mapToCartProduct?: (p: ProductoData) => ProductoPOS;
  getRemainingFor: (p: ProductoData) => number;

  // Image preview
  handleImageClick: (images: string[]) => void;

  // Pagination (server-side)
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;

  // Optional height overrides
  maxDesktopHeightPx?: number;
  maxMobileHeightPx?: number;

  // ── Modo Rápido / Escáner ──────────────────────────────────────────────
  /** ¿Está activo el modo rápido? */
  isScannerMode: boolean;
  /** Valor controlado del input del escáner */
  scanInput: string;
  /** Toggle del modo rápido (viene del padre) */
  onToggleScannerMode: () => void;
  /** Cambio de texto en el input del escáner */
  onScanInputChange: (value: string) => void;
  /**
   * El padre expone un ref al input del escáner para que PuntoVenta
   * pueda darle focus cuando lo necesite (al completar una venta, etc.)
   */
  scanInputRef: React.RefObject<HTMLInputElement>;
}

// ---------------------------------------------------------------------------
// PaginationBar (local, compacta)
// ---------------------------------------------------------------------------
interface PaginationBarProps {
  page: number;
  totalPages: number;
  totalCount: number;
  from: number;
  to: number;
  limit: number;
  onPageChange: (p: number) => void;
  onLimitChange: (n: number) => void;
  isDisabled: boolean;
  showPageSize?: boolean;
  className?: string;
}

function PaginationBar({
  page,
  totalPages,
  totalCount,
  from,
  to,
  limit,
  onPageChange,
  onLimitChange,
  isDisabled,
  showPageSize = true,
  className = "",
}: PaginationBarProps) {
  const btnCls =
    "h-6 min-w-[24px] rounded border px-1.5 text-[10px] tabular-nums disabled:opacity-40 hover:bg-muted transition-colors";

  return (
    <div
      role="navigation"
      className={`flex flex-wrap items-center justify-between gap-1.5 px-2 py-1 border-t bg-muted/20 ${className}`}
    >
      <span className="text-[10px] text-muted-foreground tabular-nums">
        {from}–{to}{" "}
        <span className="text-muted-foreground/60">/ {totalCount}</span>
      </span>

      <div className="flex items-center gap-1">
        {showPageSize && (
          <>
            <select
              className="h-6 rounded border px-1 text-[10px] bg-background text-foreground"
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              disabled={isDisabled}
              aria-label="Filas por página"
            >
              {[5, 10, 20, 30, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n} filas
                </option>
              ))}
            </select>
            <span className="text-muted-foreground/40 text-[10px]">|</span>
          </>
        )}
        <button
          type="button"
          className={btnCls}
          onClick={() => onPageChange(1)}
          disabled={isDisabled || page <= 1}
          aria-label="Primera página"
        >
          «
        </button>
        <button
          type="button"
          className={btnCls}
          onClick={() => onPageChange(page - 1)}
          disabled={isDisabled || page <= 1}
          aria-label="Página anterior"
        >
          ‹
        </button>
        <span className="text-[10px] tabular-nums px-1 text-muted-foreground">
          {page}/{Math.max(totalPages, 1)}
        </span>
        <button
          type="button"
          className={btnCls}
          onClick={() => onPageChange(page + 1)}
          disabled={isDisabled || page >= totalPages}
          aria-label="Siguiente página"
        >
          ›
        </button>
        <button
          type="button"
          className={btnCls}
          onClick={() => onPageChange(totalPages)}
          disabled={isDisabled || page >= totalPages}
          aria-label="Última página"
        >
          »
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FilterBar – extraído para mantener TablePOS compacto
// ---------------------------------------------------------------------------
interface FilterBarProps {
  searchValue: string;
  handleSearchItemsInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tiposPresentacion: TipoPresentacion[];
  categorias: CategoriaWithCount[];
  queryOptions: NewQueryDTO;
  setQueryOptions: React.Dispatch<React.SetStateAction<NewQueryDTO>>;
  // Modo escáner
  isScannerMode: boolean;
  scanInput: string;
  onToggleScannerMode: () => void;
  onScanInputChange: (value: string) => void;
  scanInputRef: React.RefObject<HTMLInputElement>;
  /** Llamado por el padre cuando hay un Enter en el escáner */
  onScanEnter: () => void;
}

function FilterBar({
  searchValue,
  handleSearchItemsInput,
  tiposPresentacion,
  categorias,
  queryOptions,
  setQueryOptions,
  isScannerMode,
  scanInput,
  onToggleScannerMode,
  onScanInputChange,
  scanInputRef,
  onScanEnter,
}: FilterBarProps) {
  const selectedTiposEmpaque = React.useMemo(
    () =>
      tiposPresentacion.filter((tp) =>
        queryOptions.tipoEmpaque.includes(tp.id),
      ),
    [tiposPresentacion, queryOptions.tipoEmpaque],
  );

  const selectedCategorias = React.useMemo(
    () => categorias.filter((cat) => queryOptions.cats.includes(cat.id)),
    [categorias, queryOptions.cats],
  );

  const handleTipoEmpaqueChange = React.useCallback(
    (arr: TipoPresentacion[]) => {
      setQueryOptions((prev) => ({
        ...prev,
        tipoEmpaque: arr.map((t) => t.id),
      }));
    },
    [setQueryOptions],
  );

  const handleSelectCategoria = React.useCallback(
    (arr: CategoriaWithCount[]) => {
      setQueryOptions((prev) => ({
        ...prev,
        cats: arr.map((cat) => cat.id),
      }));
    },
    [setQueryOptions],
  );

  return (
    <div className="mb-3 space-y-2">
      {/* Fila 1: búsqueda normal + toggle modo rápido */}
      <div className="flex flex-wrap items-end gap-2">
        {/* Input búsqueda manual (oculto en modo escáner) */}
        {!isScannerMode && (
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              id="q"
              type="search"
              placeholder="Buscar por nombre o código…"
              value={searchValue}
              onChange={handleSearchItemsInput}
              className="h-8 pl-7 pr-2 text-xs"
            />
          </div>
        )}

        {/* Input escáner (visible solo en modo rápido) */}
        {isScannerMode && (
          <div className="relative flex-1 min-w-[200px]">
            <ScanLine className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary pointer-events-none" />
            <Input
              ref={scanInputRef}
              id="scanner-input"
              type="text"
              autoComplete="off"
              placeholder="Escanear código de barras…"
              value={scanInput}
              onChange={(e) => onScanInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onScanEnter();
                }
              }}
              className="h-8 pl-7 pr-2 text-xs border-primary  ring-1 ring-offset-white/40 focus-visible:ring-primary"
            />
          </div>
        )}

        {/* Toggle Modo Rápido */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Zap
            className={`h-3.5 w-3.5 transition-colors ${
              isScannerMode ? "" : "text-muted-foreground"
            }`}
          />
          <Switch
            id="scanner-mode-switch"
            checked={isScannerMode}
            onCheckedChange={onToggleScannerMode}
            className="data-[state=checked]:bg-primary dark:bg-white"
          />
          <Label
            htmlFor="scanner-mode-switch"
            className={`text-xs cursor-pointer select-none transition-colors ${
              isScannerMode
                ? "text-primary font-medium text-white"
                : "text-muted-foreground"
            }`}
          >
            {isScannerMode ? "Modo Rápido" : "Modo Manual"}
          </Label>
        </div>
      </div>

      {/* Fila 2: filtros (siempre visibles) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="grid gap-1">
          <Label className="text-xs">Por tipo de presentación</Label>
          <ReusableSelect<TipoPresentacion>
            isClearable
            isMulti
            items={tiposPresentacion}
            getLabel={(t) => `${t.nombre} (relacionados:${t.productos})`}
            getValue={(t) => Number(t.id)}
            value={selectedTiposEmpaque}
            onChange={handleTipoEmpaqueChange}
            placeholder="Presentaciones"
            selectProps={{
              isSearchable: true,
              menuPortalTarget: document.body,
              menuPosition: "fixed",
              menuShouldScrollIntoView: false,
              styles: {
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                valueContainer: (b) => ({ ...b, padding: "0 5px" }),
              },
            }}
          />
        </div>

        <div className="grid gap-1">
          <Label className="text-xs">Por categorías</Label>
          <ReusableSelect<CategoriaWithCount>
            isClearable
            isMulti
            items={categorias}
            getLabel={(t) => `${t.nombre} (relacionados:${t.productosCount})`}
            getValue={(t) => Number(t.id)}
            value={selectedCategorias}
            onChange={handleSelectCategoria}
            placeholder="Categorías"
            selectProps={{
              isSearchable: true,
              menuPortalTarget: document.body,
              menuPosition: "fixed",
              menuShouldScrollIntoView: false,
              styles: {
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                valueContainer: (b) => ({ ...b, padding: "0 5px" }),
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TablePOS – componente principal
// ---------------------------------------------------------------------------
export default function TablePOS({
  data,
  handleSearchItemsInput,
  addToCart,
  handleImageClick,
  isLoadingProducts,
  mapToCartProduct,
  defaultMapToCartProduct,
  limit,
  onLimitChange,
  onPageChange,
  page,
  totalCount,
  totalPages,
  maxDesktopHeightPx,
  maxMobileHeightPx,
  getRemainingFor,
  searchValue,
  tiposPresentacion,
  queryOptions,
  setQueryOptions,
  categorias,
  // Modo Rápido
  isScannerMode,
  scanInput,
  onToggleScannerMode,
  onScanInputChange,
  scanInputRef,
}: TablePOSProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "nombre", desc: false },
  ]);

  const table = useReactTable({
    data,
    getRowId: (row) => `${row.__source}-${row.id}`,
    columns: columnsTablePos,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      onAddToCart: (p: ProductoData) => {
        const mapper = mapToCartProduct ?? defaultMapToCartProduct;
        addToCart(mapper(p));
      },
      onPreviewImages: handleImageClick,
      getRemainingFor,
    },
  });

  const hasData = Array.isArray(data) && data.length > 0;

  const from = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, totalCount);

  const ESTIMATED_HEADER_H = 32;
  const ESTIMATED_ROW_H = 40;
  const ESTIMATED_PADDING = 4;
  const computedBodyMaxH =
    ESTIMATED_HEADER_H +
    ESTIMATED_ROW_H * Math.max(5, limit) +
    ESTIMATED_PADDING;

  const vh =
    typeof window !== "undefined" ? window.innerHeight : computedBodyMaxH;
  const desktopBodyMaxH = Math.min(
    maxDesktopHeightPx ?? computedBodyMaxH,
    Math.max(320, Math.round(0.72 * vh)),
  );
  const mobileBodyMaxH = Math.min(
    maxMobileHeightPx ?? computedBodyMaxH,
    Math.max(280, Math.round(0.65 * vh)),
  );

  const renderSkeleton = (rows = 6) => (
    <tbody>
      {Array.from({ length: rows }).map((_, idx) => (
        <tr key={idx} className="animate-pulse border-t">
          <td className="px-2 py-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded shrink-0" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-2.5 w-20" />
              </div>
            </div>
          </td>
          <td className="px-2 py-1.5">
            <Skeleton className="h-3 w-24" />
          </td>
          <td className="px-2 py-1.5">
            <Skeleton className="h-5 w-5 rounded" />
          </td>
          <td className="px-2 py-1.5">
            <Skeleton className="h-4 w-8 rounded-sm" />
          </td>
          <td className="px-2 py-1.5">
            <Skeleton className="h-7 w-7 rounded" />
          </td>
        </tr>
      ))}
    </tbody>
  );

  /** Cuando el padre notifica un Enter en el escáner, buscamos el primer
   *  producto que coincida con el scanInput y lo agregamos al carrito. */
  const handleScanEnter = React.useCallback(() => {
    if (!scanInput.trim()) return;
    const term = scanInput.trim().toLowerCase();
    const match = data.find(
      (p) =>
        p.codigoProducto?.toLowerCase() === term ||
        p.nombre?.toLowerCase() === term,
    );
    if (match) {
      const mapper = mapToCartProduct ?? defaultMapToCartProduct;
      addToCart(mapper(match));
    }
    // El vaciado del input + refocus lo maneja el padre via callback
    onScanInputChange("");
    // Re-focus al siguiente frame para asegurar que el input está limpio
    setTimeout(() => scanInputRef.current?.focus(), 50);
  }, [
    scanInput,
    data,
    mapToCartProduct,
    defaultMapToCartProduct,
    addToCart,
    onScanInputChange,
    scanInputRef,
  ]);

  return (
    <div className="w-full">
      {/* Barra de filtros + toggle modo rápido */}
      <FilterBar
        searchValue={searchValue}
        handleSearchItemsInput={handleSearchItemsInput}
        tiposPresentacion={tiposPresentacion}
        categorias={categorias}
        queryOptions={queryOptions}
        setQueryOptions={setQueryOptions}
        isScannerMode={isScannerMode}
        scanInput={scanInput}
        onToggleScannerMode={onToggleScannerMode}
        onScanInputChange={onScanInputChange}
        scanInputRef={scanInputRef}
        onScanEnter={handleScanEnter}
      />

      {/* ===== DESKTOP ===== */}
      <div className="hidden md:flex flex-col rounded-xl border bg-card">
        <PaginationBar
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          from={from}
          to={to}
          limit={limit}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          isDisabled={isLoadingProducts}
          showPageSize
          className="border-t-0"
        />

        <div className="overflow-y-auto" style={{ maxHeight: desktopBodyMaxH }}>
          <table className="min-w-full">
            <thead className="bg-muted/50 sticky top-0 z-10 border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sort = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        onClick={
                          canSort
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                        className={`px-2 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground select-none ${
                          canSort ? "cursor-pointer hover:text-foreground" : ""
                        }`}
                      >
                        <div className="flex items-center gap-0.5">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {sort === "asc" && (
                            <span className="text-[9px]">▲</span>
                          )}
                          {sort === "desc" && (
                            <span className="text-[9px]">▼</span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            {isLoadingProducts && renderSkeleton(limit)}

            {!isLoadingProducts && hasData && (
              <tbody className="divide-y divide-border/50">
                <AnimatePresence initial={false}>
                  {table.getRowModel().rows.map((row) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className="hover:bg-muted/25 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-2 py-1.5 align-middle">
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
            )}

            {!isLoadingProducts && !hasData && (
              <tbody>
                <tr>
                  <td
                    colSpan={table.getAllColumns().length}
                    className="px-3 py-10 text-center text-xs text-muted-foreground"
                  >
                    No se encontraron productos con ese criterio.
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>

        <PaginationBar
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          from={from}
          to={to}
          limit={limit}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          isDisabled={isLoadingProducts}
          showPageSize={false}
        />
      </div>

      {/* ===== MOBILE ===== */}
      <div className="md:hidden">
        <PaginationBar
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          from={from}
          to={to}
          limit={limit}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          isDisabled={isLoadingProducts}
          showPageSize
          className="rounded-xl border bg-white"
        />
      </div>

      <div
        className="md:hidden space-y-2 overflow-y-auto rounded-xl border bg-white p-2"
        style={{ maxHeight: mobileBodyMaxH }}
      >
        {isLoadingProducts &&
          Array.from({ length: Math.min(limit, 6) }).map((_, i) => (
            <div key={i} className="rounded-lg border p-3">
              <Skeleton className="h-4 w-44 mb-2" />
              <Skeleton className="h-3 w-28 mb-2" />
              <Skeleton className="h-3 w-60 mb-3" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}

        {!isLoadingProducts && hasData && (
          <AnimatePresence initial={false}>
            {data.map((p) => {
              const precios = p.precios ?? [];
              const remaining = getRemainingFor(p);
              const isOut = remaining <= 0;
              return (
                <motion.div
                  key={`${p.__source ?? "producto"}-${p.id}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="rounded-lg border p-2.5 bg-card"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold truncate leading-tight">
                        {p.nombre}
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground truncate">
                        {p.codigoProducto}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded-sm ${
                          isOut
                            ? "bg-destructive/10 text-destructive"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {remaining}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          mapToCartProduct
                            ? addToCart(mapToCartProduct(p))
                            : addToCart(defaultMapToCartProduct(p))
                        }
                        className="h-7 w-7 flex items-center justify-center rounded bg-primary text-primary-foreground disabled:opacity-50 transition-opacity"
                        disabled={isOut}
                        title={
                          isOut ? "Sin stock" : `Agregar (disp. ${remaining})`
                        }
                      >
                        <span className="text-sm font-bold leading-none">
                          +
                        </span>
                      </button>
                    </div>
                  </div>

                  {precios.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                      {precios.slice(0, 4).map((x) => (
                        <span
                          key={x.id}
                          className="text-[10px] text-muted-foreground"
                        >
                          {x.rol}:{" "}
                          <span className="font-medium text-foreground tabular-nums">
                            Q{Number(x.precio).toFixed(2)}
                          </span>
                        </span>
                      ))}
                      {precios.length > 4 && (
                        <span className="text-[10px] text-muted-foreground/60">
                          +{precios.length - 4} más
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {!isLoadingProducts && !hasData && (
          <div className="rounded-lg border p-6 text-center text-xs text-muted-foreground bg-white">
            No se encontraron productos.
          </div>
        )}
      </div>

      {/* Paginación inferior mobile */}
      <div className="md:hidden mt-2">
        <PaginationBar
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          from={from}
          to={to}
          limit={limit}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          isDisabled={isLoadingProducts}
          showPageSize={false}
          className="rounded-xl border bg-white"
        />
      </div>
    </div>
  );
}
