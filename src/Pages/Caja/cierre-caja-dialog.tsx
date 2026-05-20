"use client";

import { useEffect, useMemo } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CuentasBancariasSelect } from "@/Types/CuentasBancarias/CuentasBancariasSelect";
import { useCloseCaja, useGetPreviaCaja } from "@/hooks/use-cajas/use-cajas";
import { getApiErrorMessageAxios } from "../Utils/UtilsErrorApi";
import { ComprobanteTipoZ, schemaBase } from "./schema/schema";
import { useStore } from "@/components/Context/ContextSucursal";
import { CerrarCajaV3Dto } from "./types/cierres.types";
// import { CerrarCajaV3Dto } from "./types/cierres.types";

type CuentaBancaria = {
  id: number;
  banco: string;
  numero: string;
  alias?: string | null;
};

type CierreCajaDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  registroCajaId: number;
  usuarioCierreId: number;
  cuentasBancarias: CuentaBancaria[];
  onClosed?: () => void;
  reloadContext: () => Promise<void>;
  cuentas: CuentasBancariasSelect[];
};

type CierreCajaFormData = z.infer<typeof schemaBase>;

type EstadoCuadre = "CUADRA" | "SOBRANTE" | "FALTANTE" | null;

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const normalizeEstadoCuadre = (
  diferencia: number,
): Exclude<EstadoCuadre, null> =>
  Math.abs(diferencia) <= 0.01
    ? "CUADRA"
    : diferencia > 0
      ? "SOBRANTE"
      : "FALTANTE";

const toInputNumber = (value: string) =>
  value === "" ? undefined : Number(value);

export function CierreCajaDialog({
  open,
  onOpenChange,
  registroCajaId,
  usuarioCierreId,
  onClosed,
  reloadContext,
  cuentas,
}: CierreCajaDialogProps) {
  const sucursalId = useStore((state) => state.sucursalId) ?? 0;
  const userId = useStore((state) => state.userId) ?? 0;

  const closeCaja = useCloseCaja();
  const getPreviaCaja = useGetPreviaCaja(sucursalId, registroCajaId, userId);

  const previa = getPreviaCaja.data;
  const isLoadingPrevia = getPreviaCaja.isPending;
  const isSubmitting = closeCaja.isPending;

  const form = useForm<CierreCajaFormData>({
    resolver: zodResolver(schemaBase),
    mode: "onChange",
    defaultValues: {
      modo: "SIN_DEPOSITO",
      abrirSiguiente: true,
      asentarVentas: true,
      dejarEnCaja: 0,
      fondoFijoSiguiente: 0,
      efectivoContado: 0,
      comentarioFinal: "",
    },
  });

  useEffect(() => {
    if (!previa || !open) return;

    form.reset({
      modo: "SIN_DEPOSITO",
      abrirSiguiente: true,
      asentarVentas: true,
      dejarEnCaja: Number(previa.fondoFijoActual ?? 0),
      fondoFijoSiguiente: Number(previa.fondoFijoActual ?? 0),
      efectivoContado: Number(previa.enCaja ?? 0),
      comentarioFinal: "",
    });
  }, [previa, open, form]);

  const watched = form.watch();

  const modo = watched.modo;
  const enCaja = round2(Number(previa?.enCaja ?? 0));
  const isDepositoTodo = watched.modo === "DEPOSITO_TODO";
  const showBaseInput = !isDepositoTodo;
  const baseDeseada = isDepositoTodo
    ? 0
    : round2(Number(watched.dejarEnCaja ?? previa?.fondoFijoActual ?? 0));

  const disponibleOperable = Math.max(0, round2(enCaja - baseDeseada));

  const requiereDeposito =
    modo === "DEPOSITO_PARCIAL" || modo === "DEPOSITO_TODO";
  const depositoCalculado = useMemo(() => {
    if (!previa) return 0;
    if (modo === "DEPOSITO_TODO") return disponibleOperable;
    if (modo === "DEPOSITO_PARCIAL") {
      const valor = Number(watched.montoParcial || 0);
      return Math.min(Math.max(valor, 0), disponibleOperable);
    }
    return 0;
  }, [previa, modo, watched.montoParcial, disponibleOperable]);

  const saldoFinalEsperado = round2(enCaja - depositoCalculado);

  const efectivoContado =
    watched.efectivoContado === undefined || watched.efectivoContado === null
      ? null
      : round2(Number(watched.efectivoContado));

  const diferenciaCuadre =
    efectivoContado === null ? null : round2(efectivoContado - enCaja);

  const estadoCuadre: EstadoCuadre =
    diferenciaCuadre === null ? null : normalizeEstadoCuadre(diferenciaCuadre);

  const estadoCuadreLabel =
    estadoCuadre === "CUADRA"
      ? "Cuadra"
      : estadoCuadre === "SOBRANTE"
        ? "Sobrante"
        : estadoCuadre === "FALTANTE"
          ? "Faltante"
          : "Pendiente";

  const estadoCuadreClass =
    estadoCuadre === "CUADRA"
      ? "text-emerald-600"
      : estadoCuadre === "SOBRANTE"
        ? "text-amber-600"
        : estadoCuadre === "FALTANTE"
          ? "text-rose-600"
          : "text-muted-foreground";

  const cuentaRequeridaError =
    requiereDeposito && !watched.cuentaBancariaId ? "Cuenta requerida" : null;

  const montoParcialError =
    watched.modo === "DEPOSITO_PARCIAL" &&
    Number(watched.montoParcial || 0) <= 0
      ? "Monto > 0"
      : null;

  const onSubmit: SubmitHandler<CierreCajaFormData> = async (data) => {
    if (!previa) return;

    const enCajaLocal = round2(Number(previa.enCaja ?? 0));
    const efectivoContadoLocal =
      data.efectivoContado === undefined || data.efectivoContado === null
        ? null
        : round2(Number(data.efectivoContado));

    if (efectivoContadoLocal === null) {
      form.setError("efectivoContado", {
        message: "Ingrese el efectivo contado",
      });
      return;
    }

    if (efectivoContadoLocal < 0) {
      form.setError("efectivoContado", {
        message: "Efectivo contado inválido",
      });
      return;
    }

    const diferenciaLocal = round2(efectivoContadoLocal - enCajaLocal);
    const estadoCuadreLocal = normalizeEstadoCuadre(diferenciaLocal);

    if (estadoCuadreLocal !== "CUADRA" && !data.comentarioFinal?.trim()) {
      form.setError("comentarioFinal", {
        message: "Comentario requerido si hay diferencia en caja",
      });
      return;
    }

    // const dejarEnCajaLocal = round2(Number(data.dejarEnCaja ?? 0));
    const dejarEnCajaLocal =
      data.modo === "DEPOSITO_TODO" ? 0 : round2(Number(data.dejarEnCaja ?? 0));

    const disponibleOperableLocal = Math.max(
      0,
      round2(enCajaLocal - dejarEnCajaLocal),
    );

    const esDeposito =
      data.modo === "DEPOSITO_PARCIAL" || data.modo === "DEPOSITO_TODO";

    let depositoCalculadoLocal = 0;

    if (data.modo === "DEPOSITO_TODO") {
      depositoCalculadoLocal = disponibleOperableLocal;
    } else if (data.modo === "DEPOSITO_PARCIAL") {
      const v = Number(data.montoParcial || 0);
      depositoCalculadoLocal = Math.min(
        Math.max(v, 0),
        disponibleOperableLocal,
      );
    }

    if (esDeposito && !data.cuentaBancariaId) {
      form.setError("cuentaBancariaId", {
        message: "Cuenta requerida",
      });
      return;
    }

    if (
      data.modo === "DEPOSITO_PARCIAL" &&
      (!data.montoParcial || data.montoParcial <= 0)
    ) {
      form.setError("montoParcial", { message: "Monto > 0" });
      return;
    }

    if (esDeposito && depositoCalculadoLocal <= 0) {
      toast.error("Sin disponible para depositar");
      return;
    }

    if (esDeposito) {
      if (!data.comprobanteTipo) {
        form.setError("comprobanteTipo", {
          message: "Tipo requerido",
        });
        return;
      }
      if (!data.comprobanteNumero?.trim()) {
        form.setError("comprobanteNumero", {
          message: "Número requerido",
        });
        return;
      }
    }

    try {
      const payload: CerrarCajaV3Dto & {
        dejarEnCaja?: number;
        asentarVentas?: boolean;
        comprobanteTipo?: string;
        comprobanteNumero?: string;
        comprobanteFecha?: string;
      } = {
        registroCajaId,
        usuarioCierreId,
        modo: data.modo,
        comentarioFinal: data.comentarioFinal?.trim() || undefined,
        dejarEnCaja: dejarEnCajaLocal,
        asentarVentas: Boolean(data.asentarVentas ?? true),
        efectivoContado: efectivoContadoLocal,
      };

      if (esDeposito) {
        payload.cuentaBancariaId = data.cuentaBancariaId!;

        const num = (data.comprobanteNumero ?? "")
          .replace(/\s+/g, " ")
          .trim()
          .toUpperCase()
          .slice(0, 64);

        payload.comprobanteTipo = data.comprobanteTipo!;
        payload.comprobanteNumero = num;

        if (data.comprobanteFecha) {
          payload.comprobanteFecha = new Date(
            `${data.comprobanteFecha}T00:00:00`,
          ).toISOString();
        }

        if (data.modo === "DEPOSITO_PARCIAL") {
          payload.montoParcial = round2(depositoCalculadoLocal);
        } else {
          delete (payload as any).montoParcial;
        }
      }

      if (data.modo === "CAMBIO_TURNO") {
        payload.abrirSiguiente = data.abrirSiguiente ?? true;
        if (payload.abrirSiguiente) {
          payload.usuarioInicioSiguienteId = data.usuarioInicioSiguienteId!;
          payload.fondoFijoSiguiente = data.fondoFijoSiguiente;
          payload.comentarioAperturaSiguiente =
            data.comentarioAperturaSiguiente;
        }
      }

      await toast.promise(closeCaja.mutateAsync(payload), {
        loading: "Cerrando...",
        success: "Caja cerrada",
        error: (error) => getApiErrorMessageAxios(error),
      });

      onOpenChange(false);
      onClosed?.();
    } catch (error) {
      console.error("Error cerrando caja:", error);
    } finally {
      await reloadContext();
    }
  };

  const desglose = previa?.desglose;
  const warnings = previa?.warnings ?? [];

  useEffect(() => {
    if (watched.modo === "DEPOSITO_TODO") {
      form.setValue("dejarEnCaja", 0);
    }
  }, [watched.modo, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg">Cerrar Caja</DialogTitle>
          <DialogDescription className="text-xs">
            Revisa el efectivo esperado, el efectivo contado y confirma el
            cierre.
          </DialogDescription>
        </DialogHeader>

        {isLoadingPrevia ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="ml-2 text-sm">Cargando...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                <div className="lg:col-span-3 space-y-3">
                  <FormField
                    control={form.control}
                    name="modo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Modo</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="grid grid-cols-3 gap-2"
                          >
                            <div className="flex items-center space-x-1">
                              <RadioGroupItem
                                value="SIN_DEPOSITO"
                                id="sin-deposito"
                              />
                              <Label
                                htmlFor="sin-deposito"
                                className="text-xs font-normal cursor-pointer"
                              >
                                Cerrar
                              </Label>
                            </div>

                            <div className="flex items-center space-x-1">
                              <RadioGroupItem
                                value="DEPOSITO_PARCIAL"
                                id="deposito-parcial"
                                disabled={disponibleOperable <= 0}
                              />
                              <Label
                                htmlFor="deposito-parcial"
                                className="text-xs font-normal cursor-pointer"
                              >
                                Parcial
                              </Label>
                            </div>

                            <div className="flex items-center space-x-1">
                              <RadioGroupItem
                                value="DEPOSITO_TODO"
                                id="deposito-todo"
                                disabled={disponibleOperable <= 0}
                              />
                              <Label
                                htmlFor="deposito-todo"
                                className="text-xs font-normal cursor-pointer"
                              >
                                Todo
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name="asentarVentas"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 mt-6">
                          <input
                            id="asentar-ventas"
                            type="checkbox"
                            className="h-3 w-3"
                            checked={!!field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                          <Label
                            htmlFor="asentar-ventas"
                            className="text-xs font-normal cursor-pointer"
                          >
                            Asentar ventas
                          </Label>
                        </FormItem>
                      )}
                    />

                    {showBaseInput && (
                      <FormField
                        control={form.control}
                        name="dejarEnCaja"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Dejar base
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min={0}
                                max={enCaja}
                                value={field.value ?? 0}
                                onChange={(e) =>
                                  field.onChange(toInputNumber(e.target.value))
                                }
                                className="h-8 text-xs"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="efectivoContado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Efectivo contado
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              placeholder="0.00"
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(toInputNumber(e.target.value))
                              }
                              className="h-8 text-xs"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {requiereDeposito && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="cuentaBancariaId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">
                                Cuenta *
                              </FormLabel>
                              <Select
                                onValueChange={(value) =>
                                  field.onChange(Number(value))
                                }
                                value={field.value?.toString() ?? ""}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Seleccionar" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {cuentas.map((cuenta) => (
                                    <SelectItem
                                      key={cuenta.id}
                                      value={cuenta.id.toString()}
                                      className="text-xs"
                                    >
                                      {cuenta.nombre ||
                                        cuenta.banco ||
                                        `****${cuenta.numero?.slice(-4) ?? ""}`}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-xs" />
                              {cuentaRequeridaError && (
                                <p className="text-xs text-red-500 mt-0.5">
                                  {cuentaRequeridaError}
                                </p>
                              )}
                            </FormItem>
                          )}
                        />

                        {watched.modo === "DEPOSITO_PARCIAL" && (
                          <FormField
                            control={form.control}
                            name="montoParcial"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">
                                  Monto depósito *
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min={0.01}
                                    max={disponibleOperable}
                                    value={field.value ?? ""}
                                    onChange={(e) =>
                                      field.onChange(
                                        toInputNumber(e.target.value),
                                      )
                                    }
                                    className="h-8 text-xs"
                                  />
                                </FormControl>
                                {montoParcialError && (
                                  <p className="text-xs text-red-500 mt-0.5">
                                    {montoParcialError}
                                  </p>
                                )}
                              </FormItem>
                            )}
                          />
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="comprobanteTipo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Tipo *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value ?? ""}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Seleccionar" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {ComprobanteTipoZ.options.map((t) => (
                                    <SelectItem
                                      key={t}
                                      value={t}
                                      className="text-xs"
                                    >
                                      {t.replace("_", " ")}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="comprobanteNumero"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">
                                Número *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ej. 123456"
                                  value={field.value ?? ""}
                                  onChange={(e) =>
                                    field.onChange(e.target.value)
                                  }
                                  maxLength={64}
                                  className="h-8 text-xs"
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="comprobanteFecha"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Fecha (opcional)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="h-8 text-xs"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <FormField
                    control={form.control}
                    name="comentarioFinal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          Comentario{" "}
                          {estadoCuadre && estadoCuadre !== "CUADRA"
                            ? "*"
                            : "(opcional)"}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Notas..."
                            {...field}
                            className="text-xs min-h-[60px] resize-none"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="lg:col-span-1">
                  <div className="border rounded p-3 text-xs space-y-2 sticky top-0">
                    <h4 className="font-semibold text-xs">Resumen</h4>

                    {estadoCuadre !== null && (
                      <div
                        className={`rounded border px-2 py-1 text-[11px] ${estadoCuadre === "CUADRA" ? "border-emerald-200 bg-emerald-50" : estadoCuadre === "SOBRANTE" ? "border-amber-200 bg-amber-50" : "border-rose-200 bg-rose-50"}`}
                      >
                        <div className={`font-semibold ${estadoCuadreClass}`}>
                          {estadoCuadreLabel}
                        </div>
                        <div className="text-muted-foreground">
                          {estadoCuadre === "CUADRA"
                            ? "El efectivo contado coincide con el esperado."
                            : `Diferencia: Q ${Math.abs(diferenciaCuadre ?? 0).toFixed(2)}`}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5 border-t pt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">En caja esperado:</span>
                        <span className="font-medium">
                          Q {enCaja.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Base:</span>
                        <span className="font-medium">
                          Q {baseDeseada.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Disponible:</span>
                        <span className="font-medium">
                          Q {disponibleOperable.toFixed(2)}
                        </span>
                      </div>

                      <div className="border-t pt-1.5 mt-1.5">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Depósito:</span>
                          <span className="font-semibold text-blue-600">
                            Q {depositoCalculado.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Saldo final:</span>
                          <span className="font-semibold text-green-600">
                            Q {saldoFinalEsperado.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="border-t pt-1.5 mt-1.5">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Contado:</span>
                          <span className="font-semibold">
                            Q {Number(efectivoContado ?? 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Diferencia:</span>
                          <span
                            className={`font-semibold ${estadoCuadre === "CUADRA" ? "text-emerald-600" : estadoCuadre === "SOBRANTE" ? "text-amber-600" : estadoCuadre === "FALTANTE" ? "text-rose-600" : ""}`}
                          >
                            {diferenciaCuadre === null
                              ? "—"
                              : `Q ${diferenciaCuadre.toFixed(2)}`}
                          </span>
                        </div>
                      </div>

                      {desglose && (
                        <div className="border-t pt-1.5 mt-1.5 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Ingresos efectivo:
                            </span>
                            <span className="font-medium">
                              Q{" "}
                              {Number(desglose.ingresosEfectivo ?? 0).toFixed(
                                2,
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Egresos:</span>
                            <span className="font-medium">
                              Q{" "}
                              {Number(desglose.egresosEfectivo ?? 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Depósitos cierre:
                            </span>
                            <span className="font-medium">
                              Q{" "}
                              {Number(desglose.depositosCierre ?? 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}

                      {warnings.length > 0 && (
                        <div className="border-t pt-1.5 mt-1.5 space-y-1">
                          {warnings.map((warning, index) => (
                            <div
                              key={`${warning}-${index}`}
                              className="rounded bg-amber-50 border border-amber-200 px-2 py-1 text-[11px] text-amber-800"
                            >
                              {warning}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-2 flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="h-8 text-xs px-3"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !form.formState.isValid}
                  className="h-8 text-xs px-3"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  )}
                  {isSubmitting ? "Cerrando..." : "Cerrar Caja"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
