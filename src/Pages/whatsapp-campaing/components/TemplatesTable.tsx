"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  MoreHorizontal,
  PauseCircle,
  RefreshCw,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  getBodyPreview,
  getStatusBadgeMeta,
  getTemplateComponentSummary,
  normalizeCategory,
} from "@/Types/whatsapp-campaing/types";
import type { MetaWhatsappTemplate } from "@/Types/whatsapp-campaing/types";

const STATUS_ICON_MAP: Record<string, React.ElementType> = {
  APPROVED: CheckCircle2,
  PENDING: Clock,
  REJECTED: XCircle,
  PAUSED: PauseCircle,
  DISABLED: Ban,
  IN_APPEAL: AlertCircle,
  PENDING_DELETION: Trash2,
  UNKNOWN: AlertCircle,
};

// ─── Atoms ────────────────────────────────────────────────────────────────────

function TemplateStatusBadge({ status }: { status: string }) {
  const { label, variant, iconKey } = getStatusBadgeMeta(status);
  const Icon = STATUS_ICON_MAP[iconKey] ?? AlertCircle;
  return (
    <Badge
      variant={variant}
      className="flex items-center gap-1 text-xs py-0.5 px-2 w-fit"
    >
      <Icon className="size-3 shrink-0" />
      <span>{label}</span>
    </Badge>
  );
}

function TemplateCategoryBadge({ category }: { category: string }) {
  const variantMap: Record<string, "default" | "secondary" | "outline"> = {
    UTILITY: "secondary",
    MARKETING: "outline",
    AUTHENTICATION: "default",
  };
  const variant = variantMap[category] ?? "outline";
  return (
    <Badge variant={variant} className="text-xs py-0.5 px-2 w-fit">
      {normalizeCategory(category)}
    </Badge>
  );
}

function TemplateComponentsBadges({
  template,
}: {
  template: MetaWhatsappTemplate;
}) {
  const summary = getTemplateComponentSummary(template);
  if (summary.length === 0)
    return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {summary.map((item, i) => (
        <Badge
          key={i}
          variant="outline"
          className="text-xs py-0 px-1.5 font-mono"
        >
          {item.label}
          {item.detail ? `: ${item.detail}` : ""}
        </Badge>
      ))}
    </div>
  );
}

function TemplatePreviewCell({ template }: { template: MetaWhatsappTemplate }) {
  const preview = getBodyPreview(template);
  const isEmpty = preview === "Sin cuerpo";
  return (
    <span
      className={`text-xs line-clamp-2 max-w-[220px] ${
        isEmpty ? "text-muted-foreground italic" : "text-foreground"
      }`}
    >
      {preview}
    </span>
  );
}

// ─── Row actions ──────────────────────────────────────────────────────────────

interface TemplateActionsProps {
  template: MetaWhatsappTemplate;
  onCopyName: (name: string) => void;
  onCopyId: (id: string) => void;
  onViewDetails: (template: MetaWhatsappTemplate) => void;
  onRefreshStatus: (template: MetaWhatsappTemplate) => void;
  onDelete: (template: MetaWhatsappTemplate) => void;
}

function TemplateActions({
  template,
  onCopyName,
  onCopyId,
  onViewDetails,
  onRefreshStatus,
  onDelete,
}: TemplateActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="size-7 p-0"
          aria-label="Acciones"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="text-sm">
        <DropdownMenuItem
          className="gap-2 text-xs"
          onSelect={() => onViewDetails(template)}
        >
          <Eye className="size-3.5" />
          Ver detalles
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2 text-xs"
          onSelect={() => onCopyName(template.name)}
        >
          <Copy className="size-3.5" />
          Copiar nombre
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2 text-xs"
          onSelect={() => onCopyId(template.id)}
        >
          <Copy className="size-3.5" />
          Copiar ID
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2 text-xs"
          onSelect={() => onRefreshStatus(template)}
        >
          <RefreshCw className="size-3.5" />
          Refrescar estado
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2 text-xs text-destructive focus:text-destructive"
          onSelect={() => onDelete(template)}
        >
          <Trash2 className="size-3.5" />
          Eliminar de Meta
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

interface TemplatesTableProps {
  templates: MetaWhatsappTemplate[];
  onCopyName: (name: string) => void;
  onCopyId: (id: string) => void;
  onViewDetails: (template: MetaWhatsappTemplate) => void;
  onRefreshStatus: (template: MetaWhatsappTemplate) => void;
  onDelete: (template: MetaWhatsappTemplate) => void;
}

export function TemplatesTable({
  templates,
  onCopyName,
  onCopyId,
  onViewDetails,
  onRefreshStatus,
  onDelete,
}: TemplatesTableProps) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="text-xs font-medium py-2 px-3">
              Nombre
            </TableHead>
            <TableHead className="text-xs font-medium py-2 px-3">
              Categoría
            </TableHead>
            <TableHead className="text-xs font-medium py-2 px-3">
              Estado
            </TableHead>
            <TableHead className="text-xs font-medium py-2 px-3">
              Idioma
            </TableHead>
            <TableHead className="text-xs font-medium py-2 px-3">
              Componentes
            </TableHead>
            <TableHead className="text-xs font-medium py-2 px-3">
              Vista previa
            </TableHead>
            <TableHead className="text-xs font-medium py-2 px-3 text-right">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow key={template.id} className="hover:bg-muted/20">
              <TableCell className="py-2 px-3">
                <span className="text-xs font-mono tracking-tight text-foreground">
                  {template.name}
                </span>
              </TableCell>
              <TableCell className="py-2 px-3">
                <TemplateCategoryBadge category={template.category} />
              </TableCell>
              <TableCell className="py-2 px-3">
                <TemplateStatusBadge status={template.status} />
              </TableCell>
              <TableCell className="py-2 px-3">
                <span className="text-xs text-muted-foreground font-mono">
                  {template.language}
                </span>
              </TableCell>
              <TableCell className="py-2 px-3">
                <TemplateComponentsBadges template={template} />
              </TableCell>
              <TableCell className="py-2 px-3">
                <TemplatePreviewCell template={template} />
              </TableCell>
              <TableCell className="py-2 px-3 text-right">
                <TemplateActions
                  template={template}
                  onCopyName={onCopyName}
                  onCopyId={onCopyId}
                  onViewDetails={onViewDetails}
                  onRefreshStatus={onRefreshStatus}
                  onDelete={onDelete}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
