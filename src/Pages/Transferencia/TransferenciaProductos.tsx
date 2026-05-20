import { useMemo, useState } from "react";
import Select from "react-select";
import { Box, Layers2, Building2 } from "lucide-react";

import { useStore } from "@/components/Context/ContextSucursal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  useGetProductosTransferencia,
  useGetSucursalesTransferencia,
  useSolicitarTransferencia,
} from "@/hooks/use-transferencias/use-transferencias";

import { AdvancedDialog } from "@/utils/components/AdvancedDialog";
import { PageTransition } from "@/components/Transition/layout-transition";

export default function TransferenciaProductos() {
  const sucursalId = useStore((s) => s.sucursalId) ?? 0;
  const userId = useStore((s) => s.userId);

  const [openConfirm, setOpenConfirm] = useState(false);

  const { data: productos = [], isLoading: loadingProductos } =
    useGetProductosTransferencia(sucursalId);

  const { data: sucursales = [] } = useGetSucursalesTransferencia();

  const { mutate: transferir, isPending } = useSolicitarTransferencia();

  const [producto, setProducto] = useState<any>(null);
  const [destino, setDestino] = useState<any>(null);
  const [cantidad, setCantidad] = useState(1);

  // === DERIVADOS ============================================================
  const totalStock = useMemo(
    () =>
      producto?.stock?.reduce((acc: number, s: any) => acc + s.cantidad, 0) ??
      0,
    [producto],
  );

  const origen = useMemo(
    () => producto?.stock?.find((s: any) => s.cantidad > 0),
    [producto],
  );

  const canSubmit =
    producto && destino && cantidad > 0 && cantidad <= totalStock && !isPending;

  // === HANDLERS ============================================================

  const resetForm = () => {
    setProducto(null);
    setDestino(null);
    setCantidad(1);
  };

  const handleSubmit = () => {
    if (!canSubmit || !origen) return;

    transferir({
      productoId: producto.id,
      cantidad,
      sucursalOrigenId: origen.sucursalId,
      sucursalDestinoId: destino.id,
      usuarioSolicitanteId: userId,
    });

    resetForm();
    setOpenConfirm(false);
  };

  // === OPTIONS =============================================================

  const productosOptions = productos.map((p: any) => ({
    value: p.id,
    label: `${p.nombre} (${p.codigoProducto})`,
  }));

  const sucursalesOptions = sucursales
    .filter((s: any) => s.id !== sucursalId)
    .map((s: any) => ({
      value: s.id,
      label: s.nombre,
    }));

  // === UI ==================================================================

  return (
    <PageTransition fallbackBackTo="/" titleHeader="Transferencia Productos">
      <div className="w-full space-y-4 p-4">
        {/* GRID RESPONSIVO */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Producto */}
          <div className="space-y-1">
            <Label>Producto</Label>
            <Select
              isClearable
              isLoading={loadingProductos}
              options={productosOptions}
              value={
                producto
                  ? {
                      value: producto.id,
                      label: `${producto.nombre} (${producto.codigoProducto})`,
                    }
                  : null
              }
              onChange={(opt) =>
                setProducto(productos.find((p: any) => p.id === opt?.value))
              }
              placeholder="Seleccionar producto..."
            />
          </div>

          {/* Destino */}
          <div className="space-y-1">
            <Label>Sucursal destino</Label>

            <Select
              isClearable
              isLoading={loadingProductos}
              options={sucursalesOptions}
              value={
                destino
                  ? {
                      value: destino.id,
                      label: `${destino.nombre}`,
                    }
                  : null
              }
              onChange={(opt) =>
                setDestino(sucursales.find((p: any) => p.id === opt?.value))
              }
              placeholder="Seleccionar producto..."
            />
          </div>
        </div>

        {/* STOCK + CANTIDAD */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center justify-between border rounded p-3 text-sm">
            <div className="flex items-center gap-2">
              <Box size={16} />
              <span>Stock disponible</span>
            </div>
            <span className="font-medium">{producto ? totalStock : "--"}</span>
          </div>

          <div className="space-y-1">
            <Label>Cantidad</Label>
            <div className="flex items-center gap-2">
              <Layers2 size={16} />
              <Input
                type="number"
                min={1}
                max={totalStock || 1}
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
              />
            </div>

            {cantidad > totalStock && (
              <p className="text-xs text-red-500">
                La cantidad excede el stock disponible
              </p>
            )}
          </div>
        </div>

        {/* RESUMEN */}
        {(producto || destino) && (
          <div className="border rounded p-3 text-sm space-y-2">
            <div className="flex justify-between">
              <span>Producto</span>
              <span>{producto?.nombre ?? "--"}</span>
            </div>
            <div className="flex justify-between">
              <span>Cantidad</span>
              <span>{cantidad}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                <Building2 size={14} />
                Destino
              </span>
              <span>{destino?.nombre ?? "--"}</span>
            </div>
          </div>
        )}

        {/* ACCIÓN */}
        <Button
          className="w-full"
          disabled={!canSubmit}
          onClick={() => setOpenConfirm(true)}
        >
          Solicitar transferencia
        </Button>

        {/* DIALOG */}
        <AdvancedDialog
          open={openConfirm}
          onOpenChange={setOpenConfirm}
          title="Solicitar transferencia de producto"
          subtitle="Confirma los datos antes de enviar"
          description="Se generará una solicitud pendiente de aprobación. El inventario no será afectado hasta su autorización."
          cancelButton={{
            label: "Volver",
            disabled: isPending,
            onClick: () => setOpenConfirm(false),
          }}
          confirmButton={{
            label: "Confirmar solicitud",
            disabled: !canSubmit,
            onClick: handleSubmit,
            loadingText: "Enviando solicitud...",
            loading: isPending,
          }}
        />
      </div>
    </PageTransition>
  );
}
