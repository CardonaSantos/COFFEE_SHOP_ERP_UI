"use client";
import { useState, useMemo, useCallback } from "react";
import ReactSelectComponent from "react-select";
import {
  Users,
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

export function WhatsappMessaginCapaing() {
  const sendCampaignMutation = useSendWhatsappCampaign();
  const { data: rawClients = [] } = useClientes();
  const [templateFilters, setTemplateFilters] =
    useState<WhatsappTemplateFilters>({
      name: "",
      language: "ALL",
      category: "ALL",
      status: "APPROVED",
    });

  console.log(setTemplateFilters);

  const { data: templatesResponse, isPending: templatesLoading } =
    useWhatsappTemplates(templateFilters);

  const templates = templatesResponse?.data ?? [];

  const [selectedTemplate, setSelectedTemplate] =
    useState<MetaWhatsappTemplate | null>(null);
  const [sendMode, setSendMode] = useState<CampaignSendMode>("SELECTED");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectionTab, setSelectionTab] = useState<"select" | "table">(
    "select",
  );
  const [search, setSearch] = useState("");
  const [purchaseFilter, setPurchaseFilter] = useState<PurchaseFilter>("all");
  const [phoneFilter, setPhoneFilter] = useState<PhoneFilter>("valid");
  const [locationFilter, setLocationFilter] = useState("");
  const [simulateQty, setSimulateQty] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [payloadOpen, setPayloadOpen] = useState(false);

  const normalizedClients = useMemo<NormalizedCliente[]>(
    () =>
      rawClients.map((c) => ({
        ...c,
        fullName: `${c.nombre ?? ""} ${c.apellidos ?? ""}`.trim(),
        normalizedPhone: isValidPhone(c.telefono)
          ? normalizePhone(c.telefono!)
          : (c.telefono ?? ""),
        isValidPhone: isValidPhone(c.telefono),
      })),
    [rawClients],
  );

  const validClients = useMemo(
    () => normalizedClients.filter((c) => c.isValidPhone),
    [normalizedClients],
  );

  const filteredClients = useMemo(() => {
    const q = search.toLowerCase().trim();
    const loc = locationFilter.toLowerCase().trim();

    return normalizedClients.filter((c) => {
      // phone filter
      if (phoneFilter === "valid" && !c.isValidPhone) return false;
      if (phoneFilter === "invalid" && c.isValidPhone) return false;

      // purchase filter
      if (purchaseFilter === "with_purchases" && c._count.compras === 0)
        return false;
      if (purchaseFilter === "without_purchases" && c._count.compras > 0)
        return false;

      // text search
      if (q) {
        const haystack = [
          c.nombre,
          c.apellidos,
          c.telefono,
          c.direccion,
          c.dpi,
          c.nit,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      // location filter
      if (loc && !c.direccion?.toLowerCase().includes(loc)) return false;

      return true;
    });
  }, [normalizedClients, search, purchaseFilter, phoneFilter, locationFilter]);

  const effectiveSelectedIds = useMemo<Set<number>>(() => {
    if (sendMode === "ALL_VALID") return new Set(validClients.map((c) => c.id));
    return selectedIds;
  }, [sendMode, validClients, selectedIds]);

  const selectedClients = useMemo(
    () =>
      normalizedClients.filter(
        (c) => effectiveSelectedIds.has(c.id) && c.isValidPhone,
      ),
    [normalizedClients, effectiveSelectedIds],
  );

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

  // ── Payload ────────────────────────────────────────────────────────────────
  const payload = useMemo<CampaignPayload | null>(() => {
    if (!selectedTemplate) return null;
    return {
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      templateLanguage: selectedTemplate.language,
      templateCategory: selectedTemplate.category as WhatsappTemplateCategory,
      sendMode,
      customerIds: selectedClients.map((c) => c.id),
      recipients: selectedClients.map((c) => ({
        customerId: c.id,
        fullName: c.fullName,
        phone: c.normalizedPhone,
      })),
      estimatedCost: {
        currency: "USD",
        unitCost,
        totalRecipients: selectedClients.length,
        totalEstimated,
      },
      filtersSnapshot: { search, purchaseFilter, phoneFilter, locationFilter },
      createdAt: new Date().toISOString(),
    };
  }, [
    selectedTemplate,
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
    selectedClients.length > 0;

  const handleToggleId = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleAllVisible = useCallback(
    (checked: boolean) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredClients
          .filter((c) => c.isValidPhone)
          .forEach((c) => {
            if (checked) next.add(c.id);
            else next.delete(c.id);
          });
        return next;
      });
    },
    [filteredClients],
  );

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setPurchaseFilter("all");
    setPhoneFilter("valid");
    setLocationFilter("");
  }, []);

  const hasActiveFilters =
    search !== "" ||
    purchaseFilter !== "all" ||
    phoneFilter !== "valid" ||
    locationFilter !== "";

  const handleConfirmSend = useCallback(() => {
    if (!payload) return;

    sendCampaignMutation.mutate(payload, {
      onSuccess: (response) => {
        console.log("Campaña enviada", response);
        setConfirmOpen(false);
      },
      onError: (error) => {
        console.error("Error enviando campaña", error);
      },
    });
  }, [payload, sendCampaignMutation]);

  const selectOptions = useMemo(
    () =>
      validClients.map((c) => ({
        value: c.id,
        label: `${c.fullName} · ${c.normalizedPhone}`,
        searchHint: [c.nombre, c.apellidos, c.telefono, c.direccion]
          .join(" ")
          .toLowerCase(),
      })),
    [validClients],
  );

  const selectValue = useMemo(
    () => selectOptions.filter((o) => selectedIds.has(o.value)),
    [selectOptions, selectedIds],
  );

  const tableValidClients = filteredClients.filter((c) => c.isValidPhone);
  const tableInvalidCount = filteredClients.filter(
    (c) => !c.isValidPhone,
  ).length;
  const allVisibleSelected =
    tableValidClients.length > 0 &&
    tableValidClients.every((c) => effectiveSelectedIds.has(c.id));

  return (
    <div className="p-4 space-y-3 max-w-screen-xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-sm font-semibold text-foreground">
          Enviar campaña WhatsApp
        </h1>
        <p className="text-xs text-muted-foreground">
          Selecciona una plantilla aprobada y los destinatarios antes de enviar.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-3 items-start">
        {/* ── Columna izquierda ─────────────────────────────────────────────── */}
        <div className="space-y-3">
          <Card>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs font-semibold">Plantilla</CardTitle>
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
                      const tpl = templates.find((t) => t.id === id) ?? null;
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
              {/* Modo ALL_VALID */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="all-valid"
                  checked={sendMode === "ALL_VALID"}
                  onCheckedChange={(v) =>
                    setSendMode(v ? "ALL_VALID" : "SELECTED")
                  }
                />
                <Label htmlFor="all-valid" className="text-xs cursor-pointer">
                  Todos los válidos ({validClients.length})
                </Label>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              {sendMode === "ALL_VALID" && (
                <div className="flex items-center gap-2 rounded-md bg-amber-50 border border-amber-200 p-2">
                  <AlertTriangle className="size-3 text-amber-600 shrink-0" />
                  <p className="text-[11px] text-amber-800">
                    Se enviará a todos los {validClients.length} clientes con
                    teléfono válido. Puede generar costo alto.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Input
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-7 text-xs col-span-2"
                />
                <Input
                  placeholder="Localidad..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="h-7 text-xs"
                />
                <div className="flex gap-1">
                  <Select
                    value={purchaseFilter}
                    onValueChange={(v) =>
                      setPurchaseFilter(v as PurchaseFilter)
                    }
                  >
                    <SelectTrigger className="h-7 text-xs flex-1">
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
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex gap-1 items-center">
                  <Label className="text-xs text-muted-foreground">
                    Teléfono:
                  </Label>
                  {(["valid", "invalid", "all"] as PhoneFilter[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setPhoneFilter(f)}
                      className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                        phoneFilter === f
                          ? "bg-foreground text-background border-foreground"
                          : "border-border text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      {f === "valid"
                        ? "Válidos"
                        : f === "invalid"
                          ? "Inválidos"
                          : "Todos"}
                    </button>
                  ))}
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

              {sendMode === "SELECTED" && (
                <Tabs
                  value={selectionTab}
                  onValueChange={(v) =>
                    setSelectionTab(v as "select" | "table")
                  }
                >
                  <TabsList className="h-7 text-xs">
                    <TabsTrigger value="select" className="text-xs h-6 gap-1">
                      <LayoutList className="size-3" />
                      Buscador
                    </TabsTrigger>
                    <TabsTrigger value="table" className="text-xs h-6 gap-1">
                      <Table2 className="size-3" />
                      Tabla
                    </TabsTrigger>
                  </TabsList>

                  {/* React Select multi */}
                  <TabsContent value="select" className="mt-2">
                    <ReactSelectComponent
                      isMulti
                      options={selectOptions}
                      value={selectValue}
                      onChange={(selected) => {
                        setSelectedIds(
                          new Set(
                            (selected as typeof selectOptions).map(
                              (o) => o.value,
                            ),
                          ),
                        );
                      }}
                      filterOption={(option, inputValue) =>
                        option.data.searchHint.includes(
                          inputValue.toLowerCase(),
                        )
                      }
                      placeholder="Buscar y seleccionar clientes..."
                      noOptionsMessage={() => "Sin resultados"}
                      className="text-black"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: "32px",
                          fontSize: "12px",
                          borderColor: "hsl(var(--border))",
                        }),
                        option: (base) => ({ ...base, fontSize: "12px" }),
                        multiValue: (base) => ({ ...base, fontSize: "11px" }),
                      }}
                    />
                  </TabsContent>

                  <TabsContent value="table" className="mt-2">
                    {tableInvalidCount > 0 && (
                      <p className="text-[11px] text-muted-foreground mb-1">
                        {tableInvalidCount} cliente(s) excluido(s) por teléfono
                        inválido.
                      </p>
                    )}
                    <div className="border rounded-md overflow-auto max-h-64">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/60 sticky top-0 z-10">
                          <tr>
                            <th className="w-8 p-2 text-left">
                              <Checkbox
                                checked={allVisibleSelected}
                                onCheckedChange={(v) =>
                                  handleToggleAllVisible(!!v)
                                }
                                aria-label="Seleccionar todos"
                              />
                            </th>
                            <th className="p-2 text-left font-medium text-muted-foreground">
                              Cliente
                            </th>
                            <th className="p-2 text-left font-medium text-muted-foreground">
                              Teléfono
                            </th>
                            <th className="p-2 text-left font-medium text-muted-foreground hidden sm:table-cell">
                              Dirección
                            </th>
                            <th className="p-2 text-center font-medium text-muted-foreground">
                              Compras
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableValidClients.length === 0 ? (
                            <tr>
                              <td
                                colSpan={5}
                                className="p-4 text-center text-muted-foreground"
                              >
                                Sin clientes para mostrar.
                              </td>
                            </tr>
                          ) : (
                            tableValidClients.map((c) => (
                              <tr
                                key={c.id}
                                className="border-t hover:bg-muted/30 cursor-pointer"
                                onClick={() => handleToggleId(c.id)}
                              >
                                <td className="p-2">
                                  <Checkbox
                                    checked={effectiveSelectedIds.has(c.id)}
                                    onCheckedChange={() => handleToggleId(c.id)}
                                    onClick={(e) => e.stopPropagation()}
                                    aria-label={`Seleccionar ${c.fullName}`}
                                  />
                                </td>
                                <td className="p-2 font-medium">
                                  {c.fullName || "—"}
                                </td>
                                <td className="p-2 font-mono">
                                  {c.normalizedPhone}
                                </td>
                                <td className="p-2 hidden sm:table-cell text-muted-foreground truncate max-w-[140px]">
                                  {c.direccion || "—"}
                                </td>
                                <td className="p-2 text-center">
                                  {c._count.compras}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Columna derecha ────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <Card>
            <CardContent className="p-3 space-y-1">
              <p className="text-xs font-semibold mb-2">Clientes</p>
              <StatRow
                icon={<Users className="size-3 text-muted-foreground" />}
                label="Total recibidos"
                value={normalizedClients.length}
              />
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
              <Separator className="my-1" />
              <StatRow
                icon={<Send className="size-3 text-primary" />}
                label="Seleccionados"
                value={selectedClients.length}
                bold
              />
            </CardContent>
          </Card>

          {/* Estimador de costos */}
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
                    onChange={(e) => setSimulateQty(e.target.value)}
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

          {/* Resumen + Enviar */}
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
                  className={`text-xs font-medium ${isReadyToSend ? "text-emerald-700" : "text-destructive"}`}
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

              {/* Payload colapsable */}
              <button
                className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1 hover:text-foreground transition-colors"
                onClick={() => setPayloadOpen((v) => !v)}
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
            <DialogTitle className="text-sm">
              Confirmar envío de campaña
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 py-1">
            <div className="rounded-md bg-destructive/10 border border-destructive/30 p-2 flex gap-2">
              <AlertTriangle className="size-3 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">
                Esta acción enviará una campaña real a los clientes
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
              disabled={!isReadyToSend}
              onClick={handleConfirmSend}
            >
              <Send className="size-3 mr-1" />
              Confirmar envío
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
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
        className={`text-xs text-right truncate max-w-[140px] ${bold ? "font-semibold" : ""} ${mono ? "font-mono" : ""}`}
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
        className={`text-right ${bold ? "font-semibold" : ""} ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
