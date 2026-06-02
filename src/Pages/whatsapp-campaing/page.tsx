"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  DEFAULT_FILTERS,
  isFiltersActive,
} from "@/Types/whatsapp-campaing/types";
import type {
  MetaPaging,
  MetaWhatsappTemplate,
  WhatsappTemplateFilters,
  MetaListResponse,
} from "@/Types/whatsapp-campaing/types";
import { TemplatesHeader } from "./components/TemplatesHeader";
import { TemplatesFilters } from "./components/TemplatesFilters";
import { TemplatesLoadingSkeleton } from "./components/TemplatesLoadingSkeleton";
import { TemplatesErrorState } from "./components/TemplatesErrorState";
import { TemplatesEmptyState } from "./components/TemplatesEmptyState";
import { TemplatesTable } from "./components/TemplatesTable";
import { TemplatesPagination } from "./components/TemplatesPagination";

// ─── API ──────────────────────────────────────────────────────────────────────

const API_BASE_URL = import.meta.env.VITE_API_URL;

async function fetchWhatsappTemplates(
  filters: Partial<WhatsappTemplateFilters>,
): Promise<MetaListResponse<MetaWhatsappTemplate>> {
  const params = new URLSearchParams();
  if (filters.name?.trim()) params.set("name", filters.name.trim());
  if (filters.language && filters.language !== "ALL")
    params.set("language", filters.language);
  if (filters.category && filters.category !== "ALL")
    params.set("category", filters.category);
  if (filters.status && filters.status !== "ALL")
    params.set("status", filters.status);

  const response = await fetch(
    `${API_BASE_URL}/whatsapp-template?${params.toString()}`,
  );
  if (!response.ok) throw new Error("No se pudieron cargar las plantillas");
  return response.json() as Promise<MetaListResponse<MetaWhatsappTemplate>>;
}

// ─── Parent component (all state & handlers live here) ────────────────────────

export default function WhatsappTemplatesPage() {
  const [filters, setFilters] =
    useState<WhatsappTemplateFilters>(DEFAULT_FILTERS);
  const [allTemplates, setAllTemplates] = useState<MetaWhatsappTemplate[]>([]);
  const [paging, setPaging] = useState<MetaPaging | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const loadTemplates = useCallback(
    async (activeFilters: WhatsappTemplateFilters) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchWhatsappTemplates(activeFilters);
        setAllTemplates(result.data ?? []);
        setPaging(result.paging);
        setPage(1);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error desconocido";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadTemplates(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived data ───────────────────────────────────────────────────────────

  const filteredTemplates = useMemo(() => {
    return allTemplates.filter((t) => {
      const nameMatch =
        !filters.name.trim() ||
        t.name.toLowerCase().includes(filters.name.trim().toLowerCase());
      const catMatch =
        filters.category === "ALL" || t.category === filters.category;
      const statusMatch =
        filters.status === "ALL" || t.status === filters.status;
      const langMatch =
        filters.language === "ALL" || t.language === filters.language;
      return nameMatch && catMatch && statusMatch && langMatch;
    });
  }, [allTemplates, filters]);

  const pagedTemplates = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTemplates.slice(start, start + pageSize);
  }, [filteredTemplates, page, pageSize]);

  const hasActiveFilters = isFiltersActive(filters);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleFilterChange = (next: Partial<WhatsappTemplateFilters>) => {
    setFilters((prev) => ({ ...prev, ...next }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const handleRefresh = () => {
    loadTemplates(filters);
    toast.info("Actualizando plantillas…");
  };

  const handleNew = () => {
    // toast.info("Creación de plantillas próximamente");
  };

  const handleCopyName = (name: string) => {
    navigator.clipboard.writeText(name).then(() => {
      toast.success("Nombre copiado al portapapeles");
    });
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id).then(() => {
      toast.success("ID copiado al portapapeles");
    });
  };

  const handleViewDetails = (_template: MetaWhatsappTemplate) => {
    toast.info("Ver detalles próximamente");
  };

  const handleRefreshStatus = (_template: MetaWhatsappTemplate) => {
    toast.info("Refrescando estado…");
  };

  const handleDelete = (_template: MetaWhatsappTemplate) => {
    toast.warning("Eliminar plantilla: confirmación pendiente de implementar");
  };

  void paging; // reserved for future cursor-based pagination

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-screen-xl space-y-4">
        <TemplatesHeader
          loading={loading}
          onRefresh={handleRefresh}
          onNew={handleNew}
        />

        <Separator />

        <Card className="border rounded-xl shadow-none">
          <CardContent className="p-3">
            <TemplatesFilters
              filters={filters}
              onChange={handleFilterChange}
              onClear={handleClearFilters}
            />
          </CardContent>
        </Card>

        <Card className="border rounded-xl shadow-none">
          <CardHeader className="p-3 pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Plantillas
                {!loading && (
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    ({filteredTemplates.length})
                  </span>
                )}
              </CardTitle>
              {hasActiveFilters && !loading && (
                <CardDescription className="text-xs">
                  Filtros activos
                </CardDescription>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-2 space-y-3">
            {loading && <TemplatesLoadingSkeleton />}

            {!loading && error && (
              <TemplatesErrorState message={error} onRetry={handleRefresh} />
            )}

            {!loading && !error && filteredTemplates.length === 0 && (
              <TemplatesEmptyState
                hasFilters={hasActiveFilters}
                onClear={handleClearFilters}
              />
            )}

            {!loading && !error && filteredTemplates.length > 0 && (
              <>
                <div className="overflow-x-auto">
                  <TemplatesTable
                    templates={pagedTemplates}
                    onCopyName={handleCopyName}
                    onCopyId={handleCopyId}
                    onViewDetails={handleViewDetails}
                    onRefreshStatus={handleRefreshStatus}
                    onDelete={handleDelete}
                  />
                </div>
                <TemplatesPagination
                  total={filteredTemplates.length}
                  page={page}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
