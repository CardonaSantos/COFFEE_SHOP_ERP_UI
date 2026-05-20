"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Box, Barcode, Asterisk, SquareMinus, DollarSign } from "lucide-react";
import { ReusableSelect } from "@/utils/components/ReactSelectComponent/ReusableSelect";
import {
  BasicInfo,
  Categoria,
  TipoPresentacion,
} from "../interfaces/DomainProdPressTypes";

interface Props {
  value: BasicInfo;
  categories: Categoria[];
  packagingTypes: TipoPresentacion[];
  onChange: (next: BasicInfo) => void;
}
export function BasicInfoForm({
  value,
  categories,
  packagingTypes,
  onChange,
}: Props) {
  const patch = (partial: Partial<BasicInfo>) =>
    onChange({ ...value, ...partial });

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <h3 className="text-sm font-medium">Datos básicos</h3>
        <p className="text-xs text-muted-foreground">
          Información esencial del producto
        </p>
      </CardHeader>

      <CardContent className="pt-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="nombre" className="text-xs">
              Nombre
            </Label>
            <div className="relative">
              <Input
                id="nombre"
                type="text"
                value={value.nombre}
                onChange={(e) => patch({ nombre: e.target.value })}
                placeholder="Nombre de producto"
                className="text-sm pr-8"
              />
              <Box className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="codigoProducto" className="text-xs">
              Código Producto
            </Label>
            <div className="relative">
              <Input
                id="codigoProducto"
                type="text"
                value={value.codigoProducto}
                onChange={(e) => patch({ codigoProducto: e.target.value })}
                placeholder="Código único"
                className="text-sm pr-8"
              />
              <Barcode className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="codigoProveedor" className="text-xs">
              Código Proveedor
            </Label>
            <div className="relative">
              <Input
                id="codigoProveedor"
                type="text"
                value={value.codigoProveedor || ""}
                onChange={(e) => patch({ codigoProveedor: e.target.value })}
                placeholder="Opcional"
                className="text-sm pr-8"
              />
              <Asterisk className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="stockMinimo" className="text-xs">
              Stock Mínimo
            </Label>
            <div className="relative">
              <Input
                id="stockMinimo"
                type="number"
                value={value.stockMinimo}
                onChange={(e) => patch({ stockMinimo: Number(e.target.value) })}
                placeholder="0"
                className="text-sm pr-8"
              />
              <SquareMinus className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="precioCostoActual" className="text-xs">
              Precio Costo
            </Label>
            <div className="relative">
              <Input
                id="precioCostoActual"
                type="number"
                inputMode="decimal"
                step="0.01"
                value={value.precioCostoActual}
                onChange={(e) =>
                  patch({ precioCostoActual: Number(e.target.value) })
                }
                placeholder="0.00"
                className="text-sm pr-8"
              />
              <DollarSign className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Tipo de presentación (opcional)</Label>
            <ReusableSelect<TipoPresentacion>
              items={packagingTypes}
              getLabel={(t) => t.nombre}
              getValue={(t) => t.id}
              value={value.tipoPresentacion ?? null}
              onChange={(opt) =>
                patch({
                  tipoPresentacionId: opt ? opt.id : null,
                  tipoPresentacion: opt ?? null,
                })
              }
              placeholder="Selecciona un tipo"
              selectProps={{
                isSearchable: true,
                isClearable: true,
                menuPortalTarget: document.body,
              }}
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="categorias" className="text-xs">
              Categorías
            </Label>
            <ReusableSelect<Categoria>
              isMulti
              items={categories}
              getLabel={(c) => c.nombre}
              getValue={(c) => c.id}
              value={value.categorias}
              onChange={(cats) => patch({ categorias: cats as Categoria[] })}
              placeholder="Seleccione categorías"
              selectProps={{ isSearchable: true, closeMenuOnSelect: false }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
