import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Package,
  Save,
  ArrowLeft,
  Store,
  AlertTriangle,
  Info,
} from "lucide-react";

import { toast } from "sonner";
import { getApiErrorMessageAxios } from "@/Pages/Utils/UtilsErrorApi";
import {
  useGetStockToEdit,
  useUpdateStock,
} from "@/hooks/use-ajuste-stock/use-ajuste-stock";
import { PageTransition } from "@/components/Transition/layout-transition";

// ============================
// Schema
// ============================

const formSchema = z.object({
  fechaIngreso: z.string().min(1),
  fechaVencimiento: z.string().optional().nullable(),
  cantidad: z.number().min(0),
});
function toInputDate(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10); // yyyy-MM-dd
}

function toISO(dateStr?: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr + "T00:00:00").toISOString();
}
type FormValues = z.infer<typeof formSchema>;

// ============================
// Component
// ============================

export default function StockEditing() {
  const { id } = useParams();
  const stockId = Number(id);

  const navigate = useNavigate();

  const { data, isLoading, error, refetch } = useGetStockToEdit(stockId);

  const { mutateAsync: updateStock, isPending } = useUpdateStock();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: data
      ? {
          fechaIngreso: toInputDate(data.fechaIngreso),
          fechaVencimiento: toInputDate(data.fechaVencimiento),
          cantidad: data.cantidad,
        }
      : undefined,
  });

  const onSubmit = async (values: FormValues) => {
    if (!data) return;

    const payload = {
      id: stockId,
      fechaIngreso: toISO(values.fechaIngreso),
      fechaVencimiento: values.fechaVencimiento
        ? toISO(values.fechaVencimiento)
        : null,
      cantidad: values.cantidad,
    };

    await toast.promise(updateStock(payload), {
      loading: "Actualizando stock...",
      success: "Stock actualizado",
      error: (e) => getApiErrorMessageAxios(e),
    });
  };

  // ============================
  // STATES
  // ============================

  if (isLoading) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>No se pudo cargar el stock</AlertDescription>
        <Button onClick={() => refetch()}>Reintentar</Button>
      </Alert>
    );
  }

  if (!data) return null;

  // ============================
  // UI
  // ============================

  return (
    <PageTransition fallbackBackTo="/" titleHeader="Edición de Stock">
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" /> Volver
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <Package className="w-5 h-5" />
              Editar stock #{data.id}
            </CardTitle>
            <CardDescription>
              Ajusta fechas y cantidad del lote.
            </CardDescription>
          </CardHeader>

          <Separator />

          <CardContent className="space-y-6 pt-6">
            {/* INFO */}
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow label="Producto" value={data.productoNombre} />
              <InfoRow label="Sucursal" value={data.sucursalNombre} />
              {data.codigoProducto && (
                <InfoRow label="Código" value={data.codigoProducto} />
              )}
            </div>

            <Separator />

            {/* FORM */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* FECHA INGRESO */}
                  <DateField
                    name="fechaIngreso"
                    label="Fecha ingreso"
                    form={form}
                  />

                  {/* FECHA VENCIMIENTO */}
                  <DateField
                    name="fechaVencimiento"
                    label="Fecha vencimiento"
                    form={form}
                    optional
                  />
                </div>

                {/* CANTIDAD */}
                <FormField
                  control={form.control}
                  name="cantidad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Impacto en inventario</AlertTitle>
                  <AlertDescription>
                    Modificar la cantidad o fechas afecta reportes y
                    trazabilidad del inventario.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => navigate(-1)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    <Save className="w-4 h-4" />
                    Guardar
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="text-sm text-muted-foreground flex gap-2">
            <Store className="w-4 h-4" />
            {data.sucursalNombre}
          </CardFooter>
        </Card>
      </div>
    </PageTransition>
  );
}

// ============================
// Subcomponentes
// ============================

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function DateField({ name, label, form }: any) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="date"
              value={field.value || ""}
              onChange={(e) => field.onChange(e.target.value || null)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
