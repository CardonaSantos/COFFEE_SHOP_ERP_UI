"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Search } from "lucide-react";
import {
  CATEGORIES,
  LANGUAGES,
  STATUSES,
  normalizeCategory,
  normalizeStatus,
  isFiltersActive,
} from "@/Types/whatsapp-campaing/types";
import type {
  WhatsappTemplateCategory,
  WhatsappTemplateFilters,
  WhatsappTemplateStatus,
} from "@/Types/whatsapp-campaing/types";

interface TemplatesFiltersProps {
  filters: WhatsappTemplateFilters;
  onChange: (next: Partial<WhatsappTemplateFilters>) => void;
  onClear: () => void;
}

export function TemplatesFilters({
  filters,
  onChange,
  onClear,
}: TemplatesFiltersProps) {
  const hasActiveFilters = isFiltersActive(filters);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input
          aria-label="Buscar por nombre"
          placeholder="Buscar nombre…"
          value={filters.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="pl-7 h-8 text-xs w-44"
        />
      </div>

      {/* Category */}
      <Select
        value={filters.category}
        onValueChange={(v) =>
          onChange({ category: v as WhatsappTemplateCategory | "ALL" })
        }
      >
        <SelectTrigger
          className="h-8 text-xs w-36"
          aria-label="Filtrar por categoría"
        >
          <Filter className="size-3 text-muted-foreground mr-1" />
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          {CATEGORIES.map((cat) => (
            <SelectItem key={cat} value={cat} className="text-xs">
              {cat === "ALL" ? "Todas las categorías" : normalizeCategory(cat)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status */}
      <Select
        value={filters.status}
        onValueChange={(v) =>
          onChange({ status: v as WhatsappTemplateStatus | "ALL" })
        }
      >
        <SelectTrigger
          className="h-8 text-xs w-36"
          aria-label="Filtrar por estado"
        >
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s} className="text-xs">
              {s === "ALL" ? "Todos los estados" : normalizeStatus(s)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Language */}
      <Select
        value={filters.language}
        onValueChange={(v) => onChange({ language: v })}
      >
        <SelectTrigger
          className="h-8 text-xs w-28"
          aria-label="Filtrar por idioma"
        >
          <SelectValue placeholder="Idioma" />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map((lang) => (
            <SelectItem key={lang} value={lang} className="text-xs">
              {lang === "ALL" ? "Todos" : lang}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-8 text-xs px-2"
        >
          Limpiar
        </Button>
      )}
    </div>
  );
}
