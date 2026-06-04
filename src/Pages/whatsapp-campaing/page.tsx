"use client";

import { useState, useMemo } from "react";
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
  MetaWhatsappTemplate,
  WhatsappTemplateFilters,
} from "@/Types/whatsapp-campaing/types";
import { TemplatesHeader } from "./components/TemplatesHeader";
import { TemplatesFilters } from "./components/TemplatesFilters";
import { TemplatesLoadingSkeleton } from "./components/TemplatesLoadingSkeleton";
import { TemplatesErrorState } from "./components/TemplatesErrorState";
import { TemplatesEmptyState } from "./components/TemplatesEmptyState";
import { TemplatesTable } from "./components/TemplatesTable";
import { TemplatesPagination } from "./components/TemplatesPagination";
import { useWhatsappTemplates } from "@/hooks/use-whatsapp-template/use-whatsapp-template";
import { PageTransition } from "@/components/Transition/layout-transition";
import { useDeleteWhatsappTemplate } from "@/hooks/use-whatsapp-template/use-delete-whatsapp-template";
import { getApiErrorMessageAxios } from "../Utils/UtilsErrorApi";

export default function WhatsappTemplatesPage() {
  const [filters, setFilters] =
    useState<WhatsappTemplateFilters>(DEFAULT_FILTERS);
  const [openConfirmDelete, setOpenConfirmDelete] = useState<boolean>(false);
  const toggleConfirmDelete = () => setOpenConfirmDelete(!openConfirmDelete);
  const deleteTemplateMutation = useDeleteWhatsappTemplate();

  const {
    data: templatesResponse,
    refetch: loadTemplates,
    isPending: loading,
    error,
  } = useWhatsappTemplates(filters);

  const allTemplates = templatesResponse?.data ?? [];
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const handleFilterChange = (next: Partial<WhatsappTemplateFilters>) => {
    setFilters((prev) => ({ ...prev, ...next }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const handleRefresh = () => {
    loadTemplates();
    toast.info("Actualizando plantillas…");
  };

  const handleNew = () => {};

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

  const handleDelete = (template: MetaWhatsappTemplate) => {
    toast.promise(deleteTemplateMutation.mutateAsync(template.name), {
      loading: "Enviando solicitud de eliminación",
      success: "Plantilla eliminada correctamente",
      error: (error) => getApiErrorMessageAxios(error),
    });
  };

  return (
    <PageTransition fallbackBackTo="/" titleHeader="Plantillas de Whatsapp">
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
                <TemplatesErrorState
                  message={error.message}
                  onRetry={handleRefresh}
                />
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
                      isDeleting={deleteTemplateMutation.isPending}
                      openConfirmDelete={openConfirmDelete}
                      toggleConfirmDelete={toggleConfirmDelete}
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
    </PageTransition>
  );
}
