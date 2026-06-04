"use client"

import { Info, Megaphone, ShieldCheck, Wrench } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { WhatsappTemplateCategory, FormErrors } from "@/Types/whatsapp-campaing/types"

const CATEGORIES: { value: WhatsappTemplateCategory; label: string }[] = [
  { value: "UTILITY", label: "Utility" },
  { value: "MARKETING", label: "Marketing" },
  { value: "AUTHENTICATION", label: "Authentication" },
]

const CATEGORY_INFO: Record<
  WhatsappTemplateCategory,
  { icon: React.ElementType; text: string; color: string }
> = {
  UTILITY: {
    icon: Wrench,
    text: "Usa Utility para mensajes transaccionales o de servicio: recordatorios de pago, confirmaciones, instalaciones, tickets o avisos importantes. No debe contener promociones.",
    color: "text-blue-600",
  },
  MARKETING: {
    icon: Megaphone,
    text: "Usa Marketing para ofertas, promociones, descuentos, campañas comerciales o mensajes de venta. Puede tener mayor costo y más revisión.",
    color: "text-orange-600",
  },
  AUTHENTICATION: {
    icon: ShieldCheck,
    text: "Usa Authentication para códigos de verificación o autenticación. Debe seguir reglas más estrictas de Meta.",
    color: "text-green-600",
  },
}

interface TemplateCategoryInfoCardProps {
  category: WhatsappTemplateCategory
  errors: FormErrors
  onCategoryChange: (v: WhatsappTemplateCategory) => void
}

export function TemplateCategoryInfoCard({
  category,
  errors,
  onCategoryChange,
}: TemplateCategoryInfoCardProps) {
  const info = CATEGORY_INFO[category]
  const Icon = info.icon

  return (
    <Card>
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Info className="size-4 text-muted-foreground" />
          Categoría
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <div className="space-y-1">
          <Label htmlFor="tpl-category" className="text-xs font-medium">
            Categoría <span className="text-destructive">*</span>
          </Label>
          <Select
            value={category}
            onValueChange={(v) => onCategoryChange(v as WhatsappTemplateCategory)}
          >
            <SelectTrigger id="tpl-category" className="h-8 text-xs">
              <SelectValue placeholder="Selecciona categoría" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value} className="text-xs">
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-xs text-destructive">{errors.category}</p>
          )}
        </div>

        <div className="flex gap-2 rounded-md border bg-muted/30 px-3 py-2.5">
          <Icon className={`size-3.5 mt-0.5 shrink-0 ${info.color}`} />
          <p className="text-xs text-muted-foreground leading-relaxed">{info.text}</p>
        </div>
      </CardContent>
    </Card>
  )
}
