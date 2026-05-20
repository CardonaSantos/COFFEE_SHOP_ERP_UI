"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowUpDown,
  Banknote,
  Calendar,
  CheckCircle,
  Clock,
  Copy,
  DollarSign,
  Hash,
  ImageIcon,
  Package,
  Receipt,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { getRegistroCaja } from "./api";
import { getApiErrorMessageAxios } from "../Utils/UtilsErrorApi";
import { formattMonedaGT } from "@/utils/formattMoneda";
import { formateDateWithMinutes } from "@/Crm/Utils/FormateDate";
import { formattFechaWithMinutes } from "../Utils/Utils";
import {
  EstadoCuadreCaja,
  MovimientoCaja,
  RegistroCajaResponse,
  VentaCaja,
} from "../CajaRegistros/interfaces/registroscajas.interfaces";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};
const tableVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

type MovimientoResumen = {
  canal: "Caja" | "Banco" | "Transferencia" | "N/A";
  signo: number;
  tipoMovimiento: "INGRESO" | "EGRESO" | "TRANSFERENCIA" | "NEUTRO";
};

type MovimientoKpis = {
  saldoInicial: number;
  ingresosCaja: number;
  egresosCajaSinDep: number;
  depositosCierreCaja: number;
  deltaCaja: number;
  enCajaEsperado: number;
  saldoFinal: number | null;
  diferencia: number | null;
};

type VentasKpis = {
  total: number;
  cantidad: number;
  ticketPromedio: number;
  efectivoCaja: number;
  banco: number;
};

type BancoKpis = {
  ingresosBanco: number;
  egresosBanco: number;
  deltaBanco: number;
  depositosPorCuenta: Array<{ cuenta: string; monto: number }>;
};

type AdminKpis = {
  gastosOperativos: number;
  costosVenta: number;
  resultadoOperativo: number;
};

function toNumber(value: unknown) {
  return Number(value ?? 0);
}

function sum(values: number[]) {
  return values.reduce((acc, n) => acc + n, 0);
}

function getEstadoBadge(estado: string) {
  switch (estado) {
    case "ABIERTO":
      return (
        <Badge variant="secondary" className="text-xs">
          ABIERTO
        </Badge>
      );
    case "CERRADO":
      return (
        <Badge variant="default" className="text-xs">
          CERRADO
        </Badge>
      );
    case "ARQUEO":
      return (
        <Badge variant="outline" className="text-xs">
          ARQUEO
        </Badge>
      );
    case "AJUSTADO":
      return (
        <Badge variant="outline" className="text-xs">
          AJUSTADO
        </Badge>
      );
    case "ANULADO":
      return (
        <Badge variant="destructive" className="text-xs">
          ANULADO
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-xs">
          N/A
        </Badge>
      );
  }
}

function getCuadreBadge(estado?: EstadoCuadreCaja | null) {
  switch (estado) {
    case EstadoCuadreCaja.CUADRA:
      return (
        <Badge className="text-xs bg-emerald-600 hover:bg-emerald-600">
          Cuadra
        </Badge>
      );
    case EstadoCuadreCaja.SOBRANTE:
      return (
        <Badge className="text-xs bg-amber-600 hover:bg-amber-600">
          Sobrante
        </Badge>
      );
    case EstadoCuadreCaja.FALTANTE:
      return (
        <Badge className="text-xs bg-rose-600 hover:bg-rose-600">
          Faltante
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-xs">
          Sin arqueo
        </Badge>
      );
  }
}

function signPrefix(n: number) {
  return n > 0 ? "+" : n < 0 ? "−" : "";
}

function getMovimientoInfo(movimiento: MovimientoCaja): MovimientoResumen {
  const deltaCaja = movimiento.deltaCaja ?? 0;
  const deltaBanco = movimiento.deltaBanco ?? 0;

  let canal: MovimientoResumen["canal"] = "N/A";
  let signo = 0;
  let tipoMovimiento: MovimientoResumen["tipoMovimiento"] = "NEUTRO";

  if (deltaCaja !== 0) {
    canal = "Caja";
    signo = Math.sign(deltaCaja);
  } else if (deltaBanco !== 0) {
    canal = "Banco";
    signo = Math.sign(deltaBanco);
  }

  if (deltaCaja < 0 && deltaBanco > 0) {
    canal = "Transferencia";
    tipoMovimiento = "TRANSFERENCIA";
    signo = 0;
  } else if (signo > 0) {
    tipoMovimiento = "INGRESO";
  } else if (signo < 0) {
    tipoMovimiento = "EGRESO";
  }

  return { canal, signo, tipoMovimiento };
}

function getTipoMovimientoIcon(
  tipoMovimiento: MovimientoResumen["tipoMovimiento"],
) {
  switch (tipoMovimiento) {
    case "INGRESO":
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    case "EGRESO":
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    case "TRANSFERENCIA":
      return <ArrowUpDown className="h-4 w-4 text-blue-600" />;
    default:
      return <DollarSign className="h-4 w-4 text-gray-600" />;
  }
}

function calcularKPIs(registro: RegistroCajaResponse) {
  const mvs = registro.movimientosCaja ?? [];
  const ventas = registro.ventas ?? [];
  const saldoInicial = toNumber(registro.saldoInicial);

  const esDepCierre = (m: MovimientoCaja) =>
    m.esDepositoCierre === true && m.motivo === "DEPOSITO_CIERRE";

  const ingresosCaja = sum(
    mvs
      .filter((m) => toNumber(m.deltaCaja) > 0)
      .map((m) => toNumber(m.deltaCaja)),
  );

  const egresosCajaSinDep = sum(
    mvs
      .filter((m) => toNumber(m.deltaCaja) < 0 && !esDepCierre(m))
      .map((m) => Math.abs(toNumber(m.deltaCaja))),
  );

  const depositosCierreCaja = sum(
    mvs.filter(esDepCierre).map((m) => Math.abs(toNumber(m.deltaCaja))),
  );

  const deltaCaja = sum(mvs.map((m) => toNumber(m.deltaCaja)));
  const enCajaEsperado = saldoInicial + deltaCaja;

  const ingresosBanco = sum(
    mvs
      .filter((m) => toNumber(m.deltaBanco) > 0)
      .map((m) => toNumber(m.deltaBanco)),
  );

  const egresosBanco = sum(
    mvs
      .filter((m) => toNumber(m.deltaBanco) < 0)
      .map((m) => Math.abs(toNumber(m.deltaBanco))),
  );

  const deltaBanco = ingresosBanco - egresosBanco;

  const ventasTotal = sum(ventas.map((v) => toNumber(v.totalVenta)));
  const ventasCantidad = ventas.length;
  const ticketPromedio = ventasCantidad ? ventasTotal / ventasCantidad : 0;

  const ventasEfectivoCaja = sum(
    mvs
      .filter((m) => m.motivo === "VENTA" && toNumber(m.deltaCaja) > 0)
      .map((m) => toNumber(m.deltaCaja)),
  );

  const ventasBancoTurno = sum(
    mvs
      .filter((m) => m.motivo === "VENTA" && toNumber(m.deltaBanco) > 0)
      .map((m) => toNumber(m.deltaBanco)),
  );

  const gastosOperativos = sum(
    mvs
      .filter((m) => m.clasificacion === "GASTO_OPERATIVO")
      .map(
        (m) =>
          Math.abs(toNumber(m.deltaCaja)) + Math.abs(toNumber(m.deltaBanco)),
      ),
  );

  const costosVenta = sum(
    mvs
      .filter((m) => m.clasificacion === "COSTO_VENTA")
      .map(
        (m) =>
          Math.abs(toNumber(m.deltaCaja)) + Math.abs(toNumber(m.deltaBanco)),
      ),
  );

  const resultadoOperativo = ventasTotal - (gastosOperativos + costosVenta);

  const diferencia =
    registro.estado === "CERRADO" && registro.saldoFinal !== null
      ? toNumber(registro.saldoFinal) - enCajaEsperado
      : null;

  const porCuenta = new Map<string, number>();
  for (const m of mvs.filter(esDepCierre)) {
    const key = m.cuentaBancaria
      ? `${m.cuentaBancaria.banco ?? "Banco"} • ${m.cuentaBancaria.alias || m.cuentaBancaria.numeroMasked || "Cuenta"}`
      : "N/A";
    porCuenta.set(
      key,
      (porCuenta.get(key) || 0) + Math.abs(toNumber(m.deltaBanco)),
    );
  }

  const depositosPorCuenta = Array.from(porCuenta.entries()).map(
    ([cuenta, monto]) => ({ cuenta, monto }),
  );

  return {
    caja: {
      saldoInicial,
      ingresosCaja,
      egresosCajaSinDep,
      depositosCierreCaja,
      deltaCaja,
      enCajaEsperado,
      saldoFinal: registro.saldoFinal ?? null,
      diferencia,
    } satisfies MovimientoKpis,
    ventas: {
      total: ventasTotal,
      cantidad: ventasCantidad,
      ticketPromedio,
      efectivoCaja: ventasEfectivoCaja,
      banco: ventasBancoTurno,
    } satisfies VentasKpis,
    banco: {
      ingresosBanco,
      egresosBanco,
      deltaBanco,
      depositosPorCuenta,
    } satisfies BancoKpis,
    admin: {
      gastosOperativos,
      costosVenta,
      resultadoOperativo,
    } satisfies AdminKpis,
  } as const;
}

function InfoStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="mt-2 text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function DetailLine({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-right">{value}</span>
    </div>
  );
}

function BadgeRow({ items }: { items: Array<string | null | undefined> }) {
  const filtered = items.filter(Boolean) as string[];
  if (!filtered.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {filtered.map((item) => (
        <Badge key={item} variant="outline" className="text-xs">
          {item}
        </Badge>
      ))}
    </div>
  );
}

function MovimientoRow({
  movimiento,
  onCopy,
}: {
  movimiento: MovimientoCaja;
  onCopy: (text: string) => void;
}) {
  const { canal, signo, tipoMovimiento } = getMovimientoInfo(movimiento);
  const monto = toNumber(movimiento.monto);

  return (
    <motion.div
      variants={rowVariants}
      className="rounded-lg border p-3 transition-colors hover:bg-muted/30"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5">
            {getTipoMovimientoIcon(tipoMovimiento)}
            <Badge
              variant={
                tipoMovimiento === "INGRESO"
                  ? "default"
                  : tipoMovimiento === "EGRESO"
                    ? "destructive"
                    : "secondary"
              }
              className="text-xs"
            >
              {tipoMovimiento}
            </Badge>
          </span>
          <Badge variant="outline" className="text-xs">
            {canal}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formattFechaWithMinutes(movimiento.fecha)}
          </span>
        </div>

        <div className="text-right">
          <p
            className={`text-sm font-semibold ${
              tipoMovimiento === "INGRESO"
                ? "text-green-600"
                : tipoMovimiento === "EGRESO"
                  ? "text-red-600"
                  : "text-blue-600"
            }`}
          >
            {tipoMovimiento === "TRANSFERENCIA" ? "" : signPrefix(signo)}
            {formattMonedaGT(monto)}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs">
          <span className="font-medium">Descripción:</span>{" "}
          {movimiento.descripcion || "—"}
        </p>

        {movimiento.categoria && (
          <Badge variant="secondary" className="text-xs">
            {movimiento.categoria}
          </Badge>
        )}

        <BadgeRow
          items={[
            movimiento.clasificacion,
            movimiento.motivo,
            movimiento.metodoPago,
            movimiento.esDepositoCierre ? "Depósito de cierre" : null,
            movimiento.esDepositoProveedor ? "Depósito a proveedor" : null,
            movimiento.gastoOperativoTipo,
            movimiento.costoVentaTipo,
            movimiento.afectaInventario ? "Afecta inventario" : null,
          ]}
        />

        <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-3">
          <div>
            <span className="font-medium">Usuario:</span>{" "}
            {movimiento.usuario?.nombre || "N/A"}
          </div>
          <div>
            <span className="font-medium">Proveedor:</span>{" "}
            {movimiento.proveedor?.nombre || "N/A"}
          </div>
          <div>
            <span className="font-medium">Cuenta:</span>{" "}
            {movimiento.cuentaBancaria ? (
              <span>
                {movimiento.cuentaBancaria.banco || "N/A"} -{" "}
                {movimiento.cuentaBancaria.alias || "N/A"} (
                {movimiento.cuentaBancaria.numeroMasked || "N/A"})
              </span>
            ) : (
              "N/A"
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-2">
          <div>
            <span className="font-medium">Boleta:</span>{" "}
            {movimiento.numeroBoleta || "—"}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Referencia:</span>
            <span className="truncate">{movimiento.referencia || "—"}</span>
            {movimiento.referencia && (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={() => onCopy(movimiento.referencia!)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function VentaRow({ venta }: { venta: VentaCaja }) {
  return (
    <motion.div
      variants={rowVariants}
      className="rounded-lg border p-3 transition-colors hover:bg-muted/30"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs">
            #{venta.id}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formattFechaWithMinutes(venta.fechaVenta)}
          </span>
          <Badge variant="secondary" className="text-xs">
            {venta.metodoPago || "N/A"}
          </Badge>
          {venta.tipoComprobante && (
            <Badge variant="outline" className="text-xs">
              {venta.tipoComprobante}
            </Badge>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold">
            {formattMonedaGT(toNumber(venta.totalVenta))}
          </p>
          <p className="text-xs text-muted-foreground">
            Cliente:{" "}
            {typeof venta.cliente === "string"
              ? venta.cliente
              : venta.cliente.nombre}
          </p>
        </div>
      </div>

      {venta.referenciaPago && venta.referenciaPago !== "N/A" && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground">
            Referencia:{" "}
            <span className="font-medium">{venta.referenciaPago}</span>
          </p>
        </div>
      )}

      <div className="space-y-2">
        <div className="mb-2 flex items-center gap-2">
          <Package className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-medium">
            Productos ({venta.productos.length})
          </span>
        </div>

        <div className="grid gap-2">
          {venta.productos.map((linea) => (
            <div
              key={linea.id}
              className="flex items-center gap-3 rounded border bg-muted/20 p-2"
            >
              <div className="flex-shrink-0">
                {linea.producto.imagenesProducto.length > 0 ? (
                  <img
                    src={
                      linea.producto.imagenesProducto[0].url ||
                      "/placeholder.svg"
                    }
                    alt={linea.producto.nombre}
                    className="h-8 w-8 rounded border object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded border bg-muted">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <p className="truncate text-xs font-medium">
                    {linea.producto.nombre}
                  </p>
                  {linea.producto.codigoProducto && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 text-xs"
                    >
                      <Hash className="h-2 w-2" />
                      {linea.producto.codigoProducto}
                    </Badge>
                  )}
                </div>
                {linea.producto.descripcion && (
                  <p className="max-w-96 truncate text-xs text-muted-foreground">
                    {linea.producto.descripcion}
                  </p>
                )}
                {linea.estado && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {linea.estado}
                  </Badge>
                )}
              </div>

              <div className="flex-shrink-0 text-right">
                <div className="mb-1 flex items-center gap-2">
                  <Badge variant="default" className="text-xs">
                    {linea.cantidad}x
                  </Badge>
                  <span className="text-xs font-medium">
                    {formattMonedaGT(linea.precioVenta)}
                  </span>
                </div>
                <p className="text-xs font-semibold">
                  {formattMonedaGT(linea.cantidad * linea.precioVenta)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function CajaDetalle() {
  const navigate = useNavigate();
  const { id } = useParams();
  const cajaID = Number(id);

  const [registro, setRegistro] = useState<RegistroCajaResponse | null>(null);

  useEffect(() => {
    const fetchRegistro = async () => {
      try {
        const response = await getRegistroCaja(cajaID);
        setRegistro(response);
      } catch (error) {
        toast.error(getApiErrorMessageAxios(error));
      }
    };

    if (!Number.isNaN(cajaID)) fetchRegistro();
  }, [cajaID]);

  const kpis = useMemo(
    () => (registro ? calcularKPIs(registro) : null),
    [registro],
  );
  const movimientosSinVentas = useMemo(
    () => (registro?.movimientosCaja || []).filter((m) => m.motivo !== "VENTA"),
    [registro],
  );

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  if (!registro || !kpis) {
    return (
      <div className="p-4">
        <h2 className="text-sm text-muted-foreground">Cargando registro…</h2>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-background p-2 sm:p-4"
    >
      <div className="mx-auto max-w-7xl space-y-4">
        <motion.div variants={itemVariants} className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold">
              Registro de Caja #{registro.id}
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              {registro.sucursal?.nombre}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {getCuadreBadge(registro.estadoCuadre)}
            {getEstadoBadge(registro.estado)}
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          <InfoStat
            icon={<Calendar className="h-4 w-4" />}
            label="Apertura"
            value={formateDateWithMinutes(registro.fechaApertura)}
          />
          <InfoStat
            icon={<Clock className="h-4 w-4" />}
            label="Cierre"
            value={
              registro.estado === "CERRADO"
                ? formateDateWithMinutes(registro.fechaCierre)
                : "En curso"
            }
          />
          <InfoStat
            icon={<ShoppingCart className="h-4 w-4" />}
            label="Ventas"
            value={String(registro.ventas?.length || 0)}
          />
          <InfoStat
            icon={<TrendingUp className="h-4 w-4" />}
            label="Movimientos"
            value={String(movimientosSinVentas.length)}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <SectionCard
            title="Resumen del turno"
            icon={<DollarSign className="h-4 w-4" />}
          >
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
              <InfoStat
                icon={<DollarSign className="h-4 w-4 text-blue-600" />}
                label="Saldo inicial"
                value={formattMonedaGT(kpis.caja.saldoInicial)}
              />
              <InfoStat
                icon={<TrendingUp className="h-4 w-4 text-green-600" />}
                label="Ingresos caja"
                value={formattMonedaGT(kpis.caja.ingresosCaja)}
              />
              <InfoStat
                icon={<TrendingDown className="h-4 w-4 text-red-600" />}
                label="Egresos caja"
                value={formattMonedaGT(kpis.caja.egresosCajaSinDep)}
              />
              <InfoStat
                icon={<Banknote className="h-4 w-4 text-indigo-600" />}
                label="Depósitos cierre"
                value={formattMonedaGT(kpis.caja.depositosCierreCaja)}
              />
              <InfoStat
                icon={<Wallet className="h-4 w-4 text-purple-600" />}
                label="En caja esperado"
                value={formattMonedaGT(kpis.caja.enCajaEsperado)}
              />
              <InfoStat
                icon={<CheckCircle className="h-4 w-4 text-teal-600" />}
                label="Depositado"
                value={registro.depositado ? "Sí" : "No"}
              />
            </div>

            {registro.estado === "CERRADO" && registro.saldoFinal !== null && (
              <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                <InfoStat
                  icon={<CheckCircle className="h-4 w-4 text-orange-600" />}
                  label="Saldo final"
                  value={formattMonedaGT(registro.saldoFinal)}
                />
                <InfoStat
                  icon={<ShoppingCart className="h-4 w-4 text-blue-600" />}
                  label="Ventas totales"
                  value={formattMonedaGT(kpis.ventas.total)}
                />
                <InfoStat
                  icon={<Wallet className="h-4 w-4 text-slate-600" />}
                  label="Resultado operativo"
                  value={formattMonedaGT(kpis.admin.resultadoOperativo)}
                />
                <InfoStat
                  icon={<Banknote className="h-4 w-4 text-rose-600" />}
                  label="Diferencia"
                  value={
                    kpis.caja.diferencia === null
                      ? "—"
                      : formattMonedaGT(kpis.caja.diferencia)
                  }
                />
              </div>
            )}
          </SectionCard>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2">
          <motion.div variants={itemVariants}>
            <SectionCard title="Usuarios" icon={<User className="h-4 w-4" />}>
              <DetailLine
                label="Apertura"
                value={registro.usuarioInicio?.nombre || "N/A"}
              />
              <Separator className="my-2" />
              <DetailLine
                label="Cierre"
                value={registro.usuarioCierre?.nombre || "N/A"}
              />
            </SectionCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <SectionCard
              title="Comentarios"
              icon={<Receipt className="h-4 w-4" />}
            >
              <DetailLine
                label="Inicial"
                value={registro.comentarioInicial || "Sin comentarios"}
              />
              <Separator className="my-2" />
              <DetailLine
                label="Final"
                value={registro.comentarioFinal || "Sin comentarios"}
              />
              <Separator className="my-2" />
              <DetailLine
                label="Cuadre"
                value={registro.comentarioCuadre || "Sin comentarios"}
              />
            </SectionCard>
          </motion.div>
        </div>

        <motion.div variants={itemVariants}>
          <SectionCard
            title="Ventas — resumen"
            icon={<ShoppingCart className="h-4 w-4" />}
          >
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
              <InfoStat
                icon={<ShoppingCart className="h-4 w-4 text-blue-600" />}
                label="Total ventas"
                value={formattMonedaGT(kpis.ventas.total)}
              />
              <InfoStat
                icon={<Wallet className="h-4 w-4 text-green-600" />}
                label="En caja"
                value={formattMonedaGT(kpis.ventas.efectivoCaja)}
              />
              <InfoStat
                icon={<Banknote className="h-4 w-4 text-emerald-600" />}
                label="En banco"
                value={formattMonedaGT(kpis.ventas.banco)}
              />
              <InfoStat
                icon={<Hash className="h-4 w-4 text-slate-600" />}
                label="# Tickets"
                value={String(kpis.ventas.cantidad)}
              />
              <InfoStat
                icon={<DollarSign className="h-4 w-4 text-slate-600" />}
                label="Ticket prom."
                value={formattMonedaGT(kpis.ventas.ticketPromedio)}
              />
              <InfoStat
                icon={<TrendingUp className="h-4 w-4 text-slate-600" />}
                label="Resultado"
                value={formattMonedaGT(kpis.admin.resultadoOperativo)}
              />
            </div>
          </SectionCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <SectionCard
            title="Banco — flujos del turno"
            icon={<Banknote className="h-4 w-4" />}
          >
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
              <InfoStat
                icon={<TrendingUp className="h-4 w-4 text-green-600" />}
                label="Ingresos banco"
                value={formattMonedaGT(kpis.banco.ingresosBanco)}
              />
              <InfoStat
                icon={<TrendingDown className="h-4 w-4 text-red-600" />}
                label="Egresos banco"
                value={formattMonedaGT(kpis.banco.egresosBanco)}
              />
              <InfoStat
                icon={<ArrowUpDown className="h-4 w-4 text-blue-600" />}
                label="Δ Banco"
                value={formattMonedaGT(kpis.banco.deltaBanco)}
              />
              <div className="md:col-span-2 xl:col-span-3 rounded-lg border p-3">
                <p className="mb-2 text-xs font-medium">Depósitos por cuenta</p>
                {kpis.banco.depositosPorCuenta.length > 0 ? (
                  <div className="space-y-1">
                    {kpis.banco.depositosPorCuenta.map((item) => (
                      <div
                        key={item.cuenta}
                        className="flex items-center justify-between gap-2 text-xs"
                      >
                        <span className="truncate">{item.cuenta}</span>
                        <span className="font-semibold tabular-nums">
                          {formattMonedaGT(item.monto)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Sin depósitos de cierre.
                  </p>
                )}
              </div>
            </div>
          </SectionCard>
        </motion.div>

        {movimientosSinVentas.length > 0 && (
          <motion.div variants={itemVariants}>
            <SectionCard
              title={`Movimientos (${movimientosSinVentas.length})`}
              icon={<TrendingUp className="h-4 w-4" />}
            >
              <motion.div
                variants={tableVariants}
                className="max-h-96 space-y-3 overflow-y-auto pr-1"
              >
                {movimientosSinVentas.map((movimiento) => (
                  <MovimientoRow
                    key={movimiento.id}
                    movimiento={movimiento}
                    onCopy={copyToClipboard}
                  />
                ))}
              </motion.div>
            </SectionCard>
          </motion.div>
        )}

        {registro.ventas?.length > 0 && (
          <motion.div variants={itemVariants}>
            <SectionCard
              title={`Ventas (${registro.ventas.length})`}
              icon={<ShoppingCart className="h-4 w-4" />}
            >
              <motion.div
                variants={tableVariants}
                className="max-h-96 space-y-3 overflow-y-auto pr-1"
              >
                {registro.ventas.map((venta) => (
                  <VentaRow key={venta.id} venta={venta} />
                ))}
              </motion.div>
            </SectionCard>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
