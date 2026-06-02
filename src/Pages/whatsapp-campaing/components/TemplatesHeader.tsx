"use client";

import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

interface TemplatesHeaderProps {
  loading: boolean;
  onRefresh: () => void;
  onNew: () => void;
}

export function TemplatesHeader({
  loading,
  onRefresh,
  onNew,
}: TemplatesHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-0.5">
        <h1 className="text-base font-semibold text-foreground leading-tight">
          Plantillas de WhatsApp
        </h1>
        <p className="text-xs text-muted-foreground">
          Consulta el estado de aprobación de tus plantillas en Meta.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          aria-label="Refrescar plantillas"
          className="h-8 text-xs gap-1.5"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          Refrescar
        </Button>

        <Link to={"/whatsapp-campaing-create-templates"}>
          <Button size="sm" className="h-8 text-xs gap-1.5" onClick={onNew}>
            <Plus className="size-3.5" />
            Nueva plantilla
          </Button>
        </Link>
      </div>
    </div>
  );
}
