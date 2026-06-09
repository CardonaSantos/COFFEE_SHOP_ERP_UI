"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import ReactSelectComponent from "react-select";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Send,
  X,
  LayoutList,
  Table2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  MetaWhatsappTemplate,
  WhatsappTemplateCategory,
  CampaignSendMode,
  PurchaseFilter,
  PhoneFilter,
  CampaignPayload,
  WhatsappTemplateFilters,
} from "@/Types/whatsapp-campaing/types";
import { getBodyPreview } from "@/Types/whatsapp-campaing/types";
import { useClientes } from "@/hooks/use-clientes/use-clientes";
import { ClientSelect } from "@/Types/clients/cliente-select";
import { useWhatsappTemplates } from "@/hooks/use-whatsapp-template/use-whatsapp-template";
import { useSendWhatsappCampaign } from "@/hooks/use-whatsapp-template/send-whatsapp-message-campaing";
import { PageTransition } from "@/components/Transition/layout-transition";
import { SelectedWhatsappTemplatePreview } from "./components/SelectedWhatsappTemplatePreview";
import { toast } from "sonner";
import { getApiErrorMessageAxios } from "@/Pages/Utils/UtilsErrorApi";

type NormalizedCliente = ClientSelect & {
  fullName: string;
  normalizedPhone: string;
  isValidPhone: boolean;
};

function isValidPhone(phone?: string | null): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-().+]/g, "");
  return /^\d{8}$/.test(cleaned);
}

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-().+]/g, "");
}

function getTemplateCostByCategory(category: WhatsappTemplateCategory): number {
  const costs: Record<WhatsappTemplateCategory, number> = {
    MARKETING:
      parseFloat(import.meta.env.VITE_WHATSAPP_COST_MARKETING ?? "") || 0,
    UTILITY: parseFloat(import.meta.env.VITE_WHATSAPP_COST_UTILITY ?? "") || 0,
    AUTHENTICATION:
      parseFloat(import.meta.env.VITE_WHATSAPP_COST_AUTHENTICATION ?? "") || 0,
  };

  return isNaN(costs[category]) ? 0 : costs[category];
}

function getCategoryLabel(category: WhatsappTemplateCategory): string {
  return (
    { MARKETING: "Marketing", UTILITY: "Utilidad", AUTHENTICATION: "Auth" }[
      category
    ] ?? category
  );
}

function getStatusBadgeVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "APPROVED") return "default";
  if (status === "PENDING") return "secondary";
  if (status === "REJECTED") return "destructive";

  return "outline";
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    APPROVED: "Aprobada",
    PENDING: "Pendiente",
    REJECTED: "Rechazada",
    PAUSED: "Pausada",
    DISABLED: "Deshabilitada",
    IN_APPEAL: "En apelación",
    PENDING_DELETION: "Por eliminar",
  };

  return map[status] ?? status;
}

const reactSelectStyles = {
  control: (base: any) => ({
    ...base,
    minHeight: "32px",
    fontSize: "12px",
    borderColor: "hsl(var(--border))",
    boxShadow: "none",
  }),
  valueContainer: (base: any) => ({
    ...base,
    paddingTop: 0,
    paddingBottom: 0,
  }),
  indicatorsContainer: (base: any) => ({
    ...base,
    minHeight: "32px",
  }),
  option: (base: any) => ({
    ...base,
    fontSize: "12px",
  }),
  placeholder: (base: any) => ({
    ...base,
    fontSize: "12px",
  }),
  singleValue: (base: any) => ({
    ...base,
    fontSize: "12px",
  }),
  multiValue: (base: any) => ({
    ...base,
    fontSize: "11px",
  }),
};

export function WhatsappMessaginCapaing() {
  const tableContainerRef = useRef<HTMLDivElement | null>(null);

  const [headerImageUrl, setHeaderImageUrl] = useState("");
  const [selectedTemplate, setSelectedTemplate] =
    useState<MetaWhatsappTemplate | null>(null);
  const [sendMode, setSendMode] = useState<CampaignSendMode>("SELECTED");
  const [selectionTab, setSelectionTab] = useState<"select" | "table">("table");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectedCustomersById, setSelectedCustomersById] = useState<
    Map<number, NormalizedCliente>
  >(new Map());

  const [search, setSearch] = useState("");
  const [purchaseFilter, setPurchaseFilter] = useState<PurchaseFilter>("all");
  const [phoneFilter, setPhoneFilter] = useState<PhoneFilter>("valid");
  const [locationFilter, setLocationFilter] = useState("");

  const [simulateQty, setSimulateQty] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [payloadOpen, setPayloadOpen] = useState(false);

  const [templateFilters, setTemplateFilters] =
    useState<WhatsappTemplateFilters>({
      name: "",
      language: "ALL",
      category: "ALL",
      status: "APPROVED",
    });

  const sendCampaignMutation = useSendWhatsappCampaign();
  const { data: rawClients = [] } = useClientes();
  const { data: templatesResponse, isPending: templatesLoading } =
    useWhatsappTemplates(templateFilters);

  const templates = templatesResponse?.data ?? [];

  const normalizedClients = useMemo<NormalizedCliente[]>(
    () =>
      rawClients.map((client) => ({
        ...client,
        fullName: `${client.nombre ?? ""} ${client.apellidos ?? ""}`.trim(),
        normalizedPhone: isValidPhone(client.telefono)
          ? normalizePhone(client.telefono!)
          : (client.telefono ?? ""),
        isValidPhone: isValidPhone(client.telefono),
      })),
    [rawClients],
  );

  const clientsById = useMemo(() => {
    return new Map(normalizedClients.map((client) => [client.id, client]));
  }, [normalizedClients]);

  const validClients = useMemo(
    () => normalizedClients.filter((client) => client.isValidPhone),
    [normalizedClients],
  );

  const filteredClients = useMemo(() => {
    const q = search.toLowerCase().trim();
    const loc = locationFilter.toLowerCase().trim();

    return normalizedClients.filter((client) => {
      if (phoneFilter === "valid" && !client.isValidPhone) return false;
      if (phoneFilter === "invalid" && client.isValidPhone) return false;

      if (purchaseFilter === "with_purchases" && client._count.compras === 0) {
        return false;
      }

      if (purchaseFilter === "without_purchases" && client._count.compras > 0) {
        return false;
      }

      if (q) {
        const haystack = [
          client.nombre,
          client.apellidos,
          client.telefono,
          client.direccion,
          client.dpi,
          client.nit,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(q)) return false;
      }

      if (loc && !client.direccion?.toLowerCase().includes(loc)) {
        return false;
      }

      return true;
    });
  }, [normalizedClients, search, purchaseFilter, phoneFilter, locationFilter]);

  const tableValidClients = useMemo(
    () => filteredClients.filter((client) => client.isValidPhone),
    [filteredClients],
  );

  const tableInvalidCount = useMemo(
    () => filteredClients.filter((client) => !client.isValidPhone).length,
    [filteredClients],
  );

  const selectedClients = useMemo(() => {
    return Array.from(selectedCustomersById.values()).filter(
      (client) => client.isValidPhone,
    );
  }, [selectedCustomersById]);

  const effectiveSelectedIds = useMemo<Set<number>>(() => {
    return selectedIds;
  }, [selectedIds]);

  const allVisibleSelected = useMemo(() => {
    return (
      tableValidClients.length > 0 &&
      tableValidClients.every((client) => selectedIds.has(client.id))
    );
  }, [tableValidClients, selectedIds]);

  const someVisibleSelected = useMemo(() => {
    return tableValidClients.some((client) => selectedIds.has(client.id));
  }, [tableValidClients, selectedIds]);

  const selectOptions = useMemo(
    () =>
      tableValidClients.map((client) => ({
        value: client.id,
        label: `${client.fullName} · ${client.normalizedPhone}`,
        searchHint: [
          client.nombre,
          client.apellidos,
          client.telefono,
          client.direccion,
          client.dpi,
          client.nit,
          String(client._count.compras),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase(),
        client,
      })),
    [tableValidClients],
  );

  const selectValue = useMemo(
    () => selectOptions.filter((option) => selectedIds.has(option.value)),
    [selectOptions, selectedIds],
  );

  const rowVirtualizer = useVirtualizer({
    count: tableValidClients.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 56,
    overscan: 8,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const unitCost = useMemo(
    () =>
      selectedTemplate
        ? getTemplateCostByCategory(
            selectedTemplate.category as WhatsappTemplateCategory,
          )
        : 0,
    [selectedTemplate],
  );

  const totalEstimated = useMemo(
    () => selectedClients.length * unitCost,
    [selectedClients.length, unitCost],
  );

  const simulatedTotal = useMemo(() => {
    const qty = parseInt(simulateQty, 10);

    return isNaN(qty) || qty <= 0 ? null : qty * unitCost;
  }, [simulateQty, unitCost]);

  const selectedTemplateHeader = useMemo(() => {
    return selectedTemplate?.components?.find(
      (component) => component.type?.toUpperCase() === "HEADER",
    );
  }, [selectedTemplate]);

  const selectedTemplateNeedsImage = selectedTemplateHeader?.format === "IMAGE";
  const hasHeaderImageUrl = Boolean(headerImageUrl.trim());
  const isMissingRequiredImageUrl =
    selectedTemplateNeedsImage && !hasHeaderImageUrl;

  const hasActiveFilters =
    search !== "" ||
    purchaseFilter !== "all" ||
    phoneFilter !== "valid" ||
    locationFilter !== "";

  const handleToggleId = useCallback(
    (id: number) => {
      const customer = clientsById.get(id);

      if (!customer?.isValidPhone) return;

      setSelectedIds((prev) => {
        const next = new Set(prev);

        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }

        return next;
      });

      setSelectedCustomersById((prev) => {
        const next = new Map(prev);

        if (next.has(customer.id)) {
          next.delete(customer.id);
        } else {
          next.set(customer.id, customer);
        }

        return next;
      });
    },
    [clientsById],
  );

  const handleToggleAllVisible = useCallback(
    (checked: boolean) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);

        tableValidClients.forEach((client) => {
          if (checked) {
            next.add(client.id);
          } else {
            next.delete(client.id);
          }
        });

        return next;
      });

      setSelectedCustomersById((prev) => {
        const next = new Map(prev);

        tableValidClients.forEach((client) => {
          if (checked) {
            next.set(client.id, client);
          } else {
            next.delete(client.id);
          }
        });

        return next;
      });
    },
    [tableValidClients],
  );

  const handleSelectedIdsChange = useCallback(
    (nextVisibleSelectedIds: Set<number>) => {
      const visibleIds = new Set(tableValidClients.map((client) => client.id));

      setSelectedIds((prev) => {
        const next = new Set(prev);

        visibleIds.forEach((id) => {
          next.delete(id);
        });

        nextVisibleSelectedIds.forEach((id) => {
          next.add(id);
        });

        return next;
      });

      setSelectedCustomersById((prev) => {
        const next = new Map(prev);

        visibleIds.forEach((id) => {
          if (!nextVisibleSelectedIds.has(id)) {
            next.delete(id);
          }
        });

        nextVisibleSelectedIds.forEach((id) => {
          const customer = clientsById.get(id);

          if (customer?.isValidPhone) {
            next.set(id, customer);
          }
        });

        return next;
      });
    },
    [tableValidClients, clientsById],
  );

  const handleRemoveSelectedCustomer = useCallback((customerId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(customerId);
      return next;
    });

    setSelectedCustomersById((prev) => {
      const next = new Map(prev);
      next.delete(customerId);
      return next;
    });
  }, []);

  const handleClearSelectedCustomers = useCallback(() => {
    setSelectedIds(new Set<number>());
    setSelectedCustomersById(new Map());
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setPurchaseFilter("all");
    setPhoneFilter("valid");
    setLocationFilter("");
  }, []);

  const handleResetAfterSuccess = useCallback(() => {
    setSelectedTemplate(null);
    setSendMode("SELECTED");
    setSelectedIds(new Set<number>());
    setSelectedCustomersById(new Map());
    setSelectionTab("table");

    setSearch("");
    setPurchaseFilter("all");
    setPhoneFilter("valid");
    setLocationFilter("");

    setSimulateQty("");
    setHeaderImageUrl("");

    setConfirmOpen(false);
    setPayloadOpen(false);

    setTemplateFilters({
      name: "",
      language: "ALL",
      category: "ALL",
      status: "APPROVED",
    });
  }, []);

  const payload = useMemo<CampaignPayload | null>(() => {
    if (!selectedTemplate) return null;

    return {
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      templateLanguage: selectedTemplate.language,
      templateCategory: selectedTemplate.category as WhatsappTemplateCategory,

      headerImageUrl:
        selectedTemplateNeedsImage && headerImageUrl.trim()
          ? headerImageUrl.trim()
          : undefined,

      sendMode,
      customerIds: selectedClients.map((client) => client.id),
      recipients: selectedClients.map((client) => ({
        customerId: client.id,
        fullName: client.fullName,
        phone: client.normalizedPhone,
      })),
      estimatedCost: {
        currency: "USD",
        unitCost,
        totalRecipients: selectedClients.length,
        totalEstimated,
      },
      filtersSnapshot: {
        search,
        purchaseFilter,
        phoneFilter,
        locationFilter,
      },
      createdAt: new Date().toISOString(),
    };
  }, [
    selectedTemplate,
    selectedTemplateNeedsImage,
    headerImageUrl,
    sendMode,
    selectedClients,
    unitCost,
    totalEstimated,
    search,
    purchaseFilter,
    phoneFilter,
    locationFilter,
  ]);

  const isReadyToSend =
    selectedTemplate !== null &&
    selectedTemplate.status === "APPROVED" &&
    selectedClients.length > 0 &&
    !isMissingRequiredImageUrl;

  const handleConfirmSend = useCallback(async () => {
    if (!payload) return;

    const totalRecipients = payload.recipients.length;

    try {
      const response = await toast.promise(
        sendCampaignMutation.mutateAsync(payload),
        {
          loading: `Enviando campaña a ${totalRecipients} cliente(s)...`,
          success: (response) => {
            const sent = response?.sent ?? 0;
            const failed = response?.failed ?? 0;

            if (failed > 0) {
              return `Campaña procesada: ${sent} enviado(s), ${failed} fallido(s)`;
            }

            return `Campaña enviada correctamente a ${sent} cliente(s)`;
          },
          error: (error) => getApiErrorMessageAxios(error),
        },
      );

      console.log("Campaña enviada", response);

      setConfirmOpen(false);
      handleResetAfterSuccess();
    } catch (error) {
      console.error("Error enviando campaña", error);
    }
  }, [payload, sendCampaignMutation, handleResetAfterSuccess]);

  return (
    <PageTransition fallbackBackTo="/" titleHeader="Envio de campañas">
      <div className="">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-3 items-start">
          <div className="space-y-3">
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs font-semibold">
                  Plantilla
                </CardTitle>
              </CardHeader>

              <CardContent className="p-3 pt-0 space-y-2">
                {templatesLoading ? (
                  <p className="text-xs text-muted-foreground">
                    Cargando plantillas...
                  </p>
                ) : (
                  <div className="grid gap-2">
                    <Select
                      value={selectedTemplate?.id ?? ""}
                      onValueChange={(id) => {
                        const tpl =
                          templates.find((item) => item.id === id) ?? null;
                        setSelectedTemplate(tpl);
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Seleccionar plantilla..." />
                      </SelectTrigger>

                      <SelectContent>
                        {templates.map((tpl) => (
                          <SelectItem
                            key={tpl.id}
                            value={tpl.id}
                            className="text-xs"
                          >
                            <span className="flex items-center gap-2">
                              <span className="font-mono">{tpl.name}</span>

                              <Badge
                                variant={getStatusBadgeVariant(tpl.status)}
                                className="text-[10px] py-0 h-4"
                              >
                                {getStatusLabel(tpl.status)}
                              </Badge>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {selectedTemplate && (
                      <div className="rounded-md border bg-muted/40 p-2 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-medium">
                            {selectedTemplate.name}
                          </span>

                          <Badge
                            variant={getStatusBadgeVariant(
                              selectedTemplate.status,
                            )}
                            className="text-[10px] py-0 h-4"
                          >
                            {getStatusLabel(selectedTemplate.status)}
                          </Badge>

                          <Badge
                            variant="outline"
                            className="text-[10px] py-0 h-4"
                          >
                            {getCategoryLabel(
                              selectedTemplate.category as WhatsappTemplateCategory,
                            )}
                          </Badge>

                          <Badge
                            variant="outline"
                            className="text-[10px] py-0 h-4"
                          >
                            {selectedTemplate.language}
                          </Badge>
                        </div>

                        {selectedTemplate.status !== "APPROVED" && (
                          <p className="text-[11px] text-destructive flex items-center gap-1">
                            <AlertTriangle className="size-3" />
                            Solo se pueden enviar plantillas aprobadas.
                          </p>
                        )}

                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                          {getBodyPreview(selectedTemplate)}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-xs font-semibold">
                  Destinatarios
                </CardTitle>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="all-valid-visible"
                    checked={
                      allVisibleSelected
                        ? true
                        : someVisibleSelected
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={(value) => {
                      handleToggleAllVisible(value === true);
                    }}
                  />

                  <Label
                    htmlFor="all-valid-visible"
                    className="text-xs cursor-pointer"
                  >
                    Seleccionar visibles válidos ({tableValidClients.length})
                  </Label>
                </div>
              </CardHeader>

              <CardContent className="p-3 pt-0 space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Input
                    placeholder="Buscar..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="h-7 text-xs col-span-2"
                  />

                  <Input
                    placeholder="Localidad..."
                    value={locationFilter}
                    onChange={(event) => setLocationFilter(event.target.value)}
                    className="h-7 text-xs"
                  />

                  <Select
                    value={purchaseFilter}
                    onValueChange={(value) =>
                      setPurchaseFilter(value as PurchaseFilter)
                    }
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="all" className="text-xs">
                        Todas las compras
                      </SelectItem>

                      <SelectItem value="with_purchases" className="text-xs">
                        Con compras
                      </SelectItem>

                      <SelectItem value="without_purchases" className="text-xs">
                        Sin compras
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex gap-1 items-center">
                    <Label className="text-xs text-muted-foreground">
                      Teléfono:
                    </Label>

                    {(["valid", "invalid", "all"] as PhoneFilter[]).map(
                      (filter) => (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => setPhoneFilter(filter)}
                          className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                            phoneFilter === filter
                              ? "bg-foreground text-background border-foreground"
                              : "border-border text-muted-foreground hover:border-foreground"
                          }`}
                        >
                          {filter === "valid"
                            ? "Válidos"
                            : filter === "invalid"
                              ? "Inválidos"
                              : "Todos"}
                        </button>
                      ),
                    )}
                  </div>

                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs px-2 ml-auto"
                      onClick={handleClearFilters}
                    >
                      <X className="size-3 mr-1" />
                      Limpiar
                    </Button>
                  )}
                </div>

                <Tabs
                  value={selectionTab}
                  onValueChange={(value) =>
                    setSelectionTab(value as "select" | "table")
                  }
                >
                  <TabsList className="h-7 text-xs">
                    <TabsTrigger value="table" className="text-xs h-6 gap-1">
                      <Table2 className="size-3" />
                      Tabla
                    </TabsTrigger>

                    <TabsTrigger value="select" className="text-xs h-6 gap-1">
                      <LayoutList className="size-3" />
                      Buscador
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="table" className="mt-2">
                    {tableInvalidCount > 0 && (
                      <p className="text-[11px] text-muted-foreground mb-1">
                        {tableInvalidCount} cliente(s) excluido(s) por teléfono
                        inválido.
                      </p>
                    )}

                    <div className="rounded-md border">
                      <div
                        role="table"
                        aria-label="Clientes válidos filtrados"
                        className="w-full text-xs"
                      >
                        <div
                          role="row"
                          className="grid grid-cols-[40px_minmax(160px,1fr)_120px_80px] sm:grid-cols-[40px_minmax(160px,1fr)_120px_minmax(140px,1fr)_80px] border-b bg-muted/60"
                        >
                          <div role="columnheader" className="p-2">
                            <Checkbox
                              checked={
                                allVisibleSelected
                                  ? true
                                  : someVisibleSelected
                                    ? "indeterminate"
                                    : false
                              }
                              onCheckedChange={(value) =>
                                handleToggleAllVisible(value === true)
                              }
                              aria-label="Seleccionar todos los clientes visibles"
                            />
                          </div>

                          <div
                            role="columnheader"
                            className="p-2 font-medium text-muted-foreground"
                          >
                            Cliente
                          </div>

                          <div
                            role="columnheader"
                            className="p-2 font-medium text-muted-foreground"
                          >
                            Teléfono
                          </div>

                          <div
                            role="columnheader"
                            className="hidden p-2 font-medium text-muted-foreground sm:block"
                          >
                            Dirección
                          </div>

                          <div
                            role="columnheader"
                            className="p-2 text-center font-medium text-muted-foreground"
                          >
                            Compras
                          </div>
                        </div>

                        {tableValidClients.length === 0 ? (
                          <div className="p-4 text-center text-muted-foreground">
                            Sin clientes para mostrar.
                          </div>
                        ) : (
                          <div
                            ref={tableContainerRef}
                            className="max-h-72 overflow-auto"
                          >
                            <div
                              role="rowgroup"
                              style={{
                                height: `${totalSize}px`,
                                width: "100%",
                                position: "relative",
                              }}
                            >
                              {virtualRows.map((virtualRow) => {
                                const client =
                                  tableValidClients[virtualRow.index];

                                if (!client) return null;

                                return (
                                  <div
                                    key={client.id}
                                    role="row"
                                    className="absolute left-0 top-0 grid w-full cursor-pointer grid-cols-[40px_minmax(160px,1fr)_120px_80px] sm:grid-cols-[40px_minmax(160px,1fr)_120px_minmax(140px,1fr)_80px] items-center border-b text-xs hover:bg-muted/30"
                                    style={{
                                      minHeight: `${virtualRow.size}px`,
                                      transform: `translateY(${virtualRow.start}px)`,
                                    }}
                                    onClick={() => handleToggleId(client.id)}
                                  >
                                    <div role="cell" className="p-2">
                                      <Checkbox
                                        checked={effectiveSelectedIds.has(
                                          client.id,
                                        )}
                                        onCheckedChange={() =>
                                          handleToggleId(client.id)
                                        }
                                        onClick={(event) =>
                                          event.stopPropagation()
                                        }
                                        aria-label={`Seleccionar ${client.fullName}`}
                                      />
                                    </div>

                                    <div role="cell" className="min-w-0 p-2">
                                      <p className="truncate font-medium">
                                        {client.fullName || "—"}
                                      </p>

                                      {(client.nit || client.dpi) && (
                                        <p className="truncate text-[11px] text-muted-foreground">
                                          {client.nit
                                            ? `NIT: ${client.nit}`
                                            : `DPI: ${client.dpi}`}
                                        </p>
                                      )}
                                    </div>

                                    <div role="cell" className="p-2 font-mono">
                                      {client.normalizedPhone || "—"}
                                    </div>

                                    <div
                                      role="cell"
                                      className="hidden min-w-0 p-2 text-muted-foreground sm:block"
                                    >
                                      <span className="block truncate">
                                        {client.direccion || "—"}
                                      </span>
                                    </div>

                                    <div
                                      role="cell"
                                      className="p-2 text-center font-mono"
                                    >
                                      {client._count.compras}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="select" className="mt-2">
                    <ReactSelectComponent
                      isMulti
                      options={selectOptions}
                      value={selectValue}
                      onChange={(selected) => {
                        const selectedOptions =
                          selected as typeof selectOptions;

                        handleSelectedIdsChange(
                          new Set(
                            selectedOptions.map((option) => option.value),
                          ),
                        );
                      }}
                      filterOption={(option, inputValue) => {
                        const searchValue = inputValue.toLowerCase().trim();

                        if (!searchValue) return true;

                        return option.data.searchHint.includes(searchValue);
                      }}
                      formatOptionLabel={(option) => (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-medium">
                            {option.client.fullName || "Cliente sin nombre"}
                          </span>

                          <span className="text-[11px] text-muted-foreground">
                            {option.client.normalizedPhone || "Sin teléfono"} ·{" "}
                            {option.client._count.compras} compra(s)
                          </span>
                        </div>
                      )}
                      placeholder="Buscar y seleccionar clientes..."
                      noOptionsMessage={() => "Sin clientes válidos"}
                      className="text-black"
                      styles={reactSelectStyles}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <Card>
              <CardContent className="p-3 space-y-1">
                <p className="text-xs font-semibold mb-2">Clientes</p>

                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="w-full rounded-md px-1 py-1 text-left transition-colors hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={selectedClients.length === 0}
                    >
                      <StatRow
                        icon={<Send className="size-3 text-primary" />}
                        label="Seleccionados"
                        value={selectedClients.length}
                        bold
                      />
                    </button>
                  </DialogTrigger>

                  <DialogContent className="max-w-md p-3">
                    <DialogHeader className="space-y-1">
                      <DialogTitle className="text-sm">
                        Clientes seleccionados
                      </DialogTitle>
                    </DialogHeader>

                    <div className="max-h-80 overflow-auto rounded-md border">
                      {selectedClients.length === 0 ? (
                        <div className="p-4 text-center text-xs text-muted-foreground">
                          No hay clientes seleccionados.
                        </div>
                      ) : (
                        <div className="divide-y">
                          {selectedClients.map((client) => (
                            <div
                              key={client.id}
                              className="flex items-center justify-between gap-2 p-2"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-xs font-medium">
                                  {client.fullName || "Cliente sin nombre"}
                                </p>

                                <p className="truncate text-[11px] text-muted-foreground">
                                  {client.normalizedPhone || "Sin teléfono"} ·{" "}
                                  {client._count.compras} compra(s)
                                </p>
                              </div>

                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 shrink-0 px-2 text-[11px]"
                                onClick={() =>
                                  handleRemoveSelectedCustomer(client.id)
                                }
                              >
                                Quitar
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {selectedClients.length > 0 && (
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={handleClearSelectedCustomers}
                        >
                          Limpiar todos
                        </Button>
                      </DialogFooter>
                    )}
                  </DialogContent>
                </Dialog>

                <Separator className="my-1" />

                <StatRow
                  icon={<CheckCircle2 className="size-3 text-emerald-600" />}
                  label="Válidos"
                  value={validClients.length}
                />

                <StatRow
                  icon={<XCircle className="size-3 text-destructive" />}
                  label="Excluidos"
                  value={normalizedClients.length - validClients.length}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs font-semibold flex items-center gap-1">
                  <DollarSign className="size-3" />
                  Estimación de gasto
                </CardTitle>
              </CardHeader>

              <CardContent className="p-3 pt-0 space-y-1">
                <StatRow
                  label="Categoría"
                  value={
                    selectedTemplate
                      ? getCategoryLabel(
                          selectedTemplate.category as WhatsappTemplateCategory,
                        )
                      : "—"
                  }
                />

                <StatRow
                  label="Costo unitario"
                  value={
                    unitCost > 0 ? `$${unitCost.toFixed(4)}` : "No configurado"
                  }
                />

                <StatRow label="Destinatarios" value={selectedClients.length} />

                <Separator className="my-1" />

                <StatRow
                  label="Total estimado"
                  value={unitCost > 0 ? `$${totalEstimated.toFixed(4)}` : "—"}
                  bold
                />

                <div className="pt-2 space-y-1">
                  <Label className="text-[11px] text-muted-foreground">
                    Simular cantidad
                  </Label>

                  <div className="flex gap-1 items-center">
                    <Input
                      type="number"
                      min="0"
                      placeholder="Ej. 500"
                      value={simulateQty}
                      onChange={(event) => setSimulateQty(event.target.value)}
                      className="h-7 text-xs"
                    />

                    {simulatedTotal !== null && (
                      <span className="text-xs font-mono whitespace-nowrap text-muted-foreground">
                        = ${simulatedTotal.toFixed(4)}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedTemplateNeedsImage && (
              <div className="rounded-md border bg-muted/30 p-2 space-y-1">
                <Label className="text-xs">
                  Imagen de encabezado requerida
                </Label>

                <Input
                  value={headerImageUrl}
                  onChange={(event) => setHeaderImageUrl(event.target.value)}
                  placeholder="https://..."
                  className="h-8 text-xs"
                />

                <p className="text-[11px] text-muted-foreground">
                  Esta plantilla tiene HEADER IMAGE. Debes usar una URL pública
                  accesible por Meta.
                </p>
              </div>
            )}

            <SelectedWhatsappTemplatePreview
              template={selectedTemplate}
              headerImageUrl={headerImageUrl}
            />

            <Card className={isReadyToSend ? "border-primary/40" : ""}>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs font-semibold flex items-center gap-1">
                  <Send className="size-3" />
                  Resumen
                </CardTitle>
              </CardHeader>

              <CardContent className="p-3 pt-0 space-y-1">
                <StatRow
                  label="Plantilla"
                  value={selectedTemplate?.name ?? "—"}
                  mono
                />

                <StatRow
                  label="Categoría"
                  value={
                    selectedTemplate
                      ? getCategoryLabel(
                          selectedTemplate.category as WhatsappTemplateCategory,
                        )
                      : "—"
                  }
                />

                <StatRow label="Seleccionados" value={selectedClients.length} />

                <StatRow
                  label="Costo estimado"
                  value={unitCost > 0 ? `$${totalEstimated.toFixed(4)}` : "—"}
                />

                <Separator className="my-1" />

                <div className="flex items-center gap-1 py-1">
                  {isReadyToSend ? (
                    <CheckCircle2 className="size-3 text-emerald-600" />
                  ) : (
                    <XCircle className="size-3 text-destructive" />
                  )}

                  <span
                    className={`text-xs font-medium ${
                      isReadyToSend ? "text-emerald-700" : "text-destructive"
                    }`}
                  >
                    {isReadyToSend
                      ? "Listo para enviar"
                      : "Completa los campos requeridos"}
                  </span>
                </div>

                <Button
                  size="sm"
                  className="w-full h-8 text-xs mt-1"
                  disabled={!isReadyToSend}
                  onClick={() => setConfirmOpen(true)}
                >
                  <Send className="size-3 mr-1" />
                  Enviar campaña
                </Button>

                <button
                  type="button"
                  className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1 hover:text-foreground transition-colors"
                  onClick={() => setPayloadOpen((value) => !value)}
                >
                  {payloadOpen ? (
                    <ChevronUp className="size-3" />
                  ) : (
                    <ChevronDown className="size-3" />
                  )}
                  {payloadOpen ? "Ocultar" : "Ver"} payload
                </button>

                {payloadOpen && (
                  <pre className="text-[10px] bg-muted rounded p-2 overflow-auto max-h-40 leading-relaxed">
                    {payload ? JSON.stringify(payload, null, 2) : "Sin datos"}
                  </pre>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-sm text-center">
                Confirmar envío de campaña
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-2 py-1">
              <div className="rounded-md bg-destructive/10 border border-destructive/30 p-2 flex gap-2">
                <AlertTriangle className="size-3 text-destructive shrink-0 mt-0.5" />

                <p className="text-xs text-destructive">
                  Esta acción enviará la campaña por Whatsapp a los clientes
                  seleccionados.
                </p>
              </div>

              <div className="space-y-1 text-xs">
                <ConfirmRow
                  label="Plantilla"
                  value={selectedTemplate?.name ?? "—"}
                  mono
                />

                <ConfirmRow
                  label="Categoría"
                  value={
                    selectedTemplate
                      ? getCategoryLabel(
                          selectedTemplate.category as WhatsappTemplateCategory,
                        )
                      : "—"
                  }
                />

                <ConfirmRow
                  label="Estado"
                  value={
                    selectedTemplate
                      ? getStatusLabel(selectedTemplate.status)
                      : "—"
                  }
                />

                <ConfirmRow label="Clientes" value={selectedClients.length} />

                <ConfirmRow
                  label="Total estimado"
                  value={
                    unitCost > 0
                      ? `$${totalEstimated.toFixed(4)} USD`
                      : "No configurado"
                  }
                  bold
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setConfirmOpen(false)}
              >
                Cancelar
              </Button>

              <Button
                size="sm"
                className="text-xs"
                disabled={
                  !isReadyToSend ||
                  sendCampaignMutation.isPending ||
                  isMissingRequiredImageUrl
                }
                onClick={handleConfirmSend}
              >
                <Send className="size-3 mr-1" />
                {sendCampaignMutation.isPending
                  ? "Enviando..."
                  : "Confirmar envío"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}

function StatRow({
  icon,
  label,
  value,
  bold,
  mono,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  bold?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        {icon}
        {label}
      </span>

      <span
        className={`text-xs text-right truncate max-w-[140px] ${
          bold ? "font-semibold" : ""
        } ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function ConfirmRow({
  label,
  value,
  bold,
  mono,
}: {
  label: string;
  value: string | number;
  bold?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-0.5 border-b border-border/40 last:border-0">
      <span className="text-muted-foreground">{label}</span>

      <span
        className={`text-right ${bold ? "font-semibold" : ""} ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
