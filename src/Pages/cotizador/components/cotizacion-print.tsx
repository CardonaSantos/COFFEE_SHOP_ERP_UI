"use client";

import { forwardRef, useEffect, useMemo, useState } from "react";
import { costoAdicional } from "../page";
import { CartItem } from "@/Types/POS/interfaces";
import { Sucursal } from "@/Types/Sucursal/Sucursal_Info";

const logoUrl = import.meta.env.VITE_APP_LOGO;

type FrecuenciaPago = "SEMANAL" | "QUINCENAL" | "MENSUAL";

type CreditoPrintConfig = {
  cuotas: number;
  enganche: number;
  tasaInteres: number;
  gastosAdministrativos: number;
  frecuenciaPago: FrecuenciaPago;
  fechaPrimerPago: string;
  incluirCostosEnCredito: boolean;
  requiereAprobacion: boolean;
};

type CotizacionPrintConfig = {
  numeroCotizacion: string;
  fechaEmision: string;
  fechaVencimiento: string;
  validezDias: number;
  tiempoEntrega: string;
  garantia: string;
  condiciones: string;
  estado?: string;
};

interface Props {
  cart: CartItem[];
  cliente: string;
  sucursal: Sucursal;

  /**
   * Props actuales que ya venían del cotizador viejo.
   * Se mantienen para que el componente no rompa si todavía no actualizas la page.
   */
  totalCarrito: number;
  totalDescuento: number;
  totalConDescuento: number;
  cuotas: number;
  cantidadPorCuota: number;
  enganche: number;
  comentario: string;
  formatCurrency: (n: number) => string;
  costos_adicionales: Array<costoAdicional>;

  /**
   * Props nuevas opcionales para cotización formal.
   */
  cotizacion?: CotizacionPrintConfig;
  credito?: CreditoPrintConfig;
  metodoPago?: string;
  tipoComprobante?: string | null;
  vendedor?: string;

  clienteTelefono?: string;
  clienteDpi?: string;
  clienteNit?: string;
  clienteDireccion?: string;

  subtotalProductos?: number;
  subtotalConDescuento?: number;
  totalCostosAdicionales?: number;
  totalContado?: number;

  baseFinanciable?: number;
  saldoAntesInteres?: number;
  totalInteres?: number;
  totalFinanciado?: number;
  pagoInicialTotal?: number;
  totalCreditoEstimado?: number;

  observaciones?: string;
}

async function imageUrlToDataUrl(url: string): Promise<string> {
  const response = await fetch(url, {
    mode: "cors",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`No se pudo cargar el logo: ${response.status}`);
  }

  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      resolve(reader.result as string);
    };

    reader.onerror = () => {
      reject(new Error("No se pudo convertir el logo a base64"));
    };

    reader.readAsDataURL(blob);
  });
}

function toDateLabel(value?: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("es-GT", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function addDaysISO(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

const frecuenciaLabel: Record<FrecuenciaPago, string> = {
  SEMANAL: "Semanal",
  QUINCENAL: "Quincenal",
  MENSUAL: "Mensual",
};

const tableHeadCell: React.CSSProperties = {
  padding: "7px 8px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.4px",
  border: "1px solid #d9efe6",
};

const tableCell: React.CSSProperties = {
  padding: "6px 8px",
  border: "1px solid #e8e8e8",
  verticalAlign: "top",
};

const CotizacionPrint = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const {
    cart,
    sucursal,
    cliente,
    clienteTelefono,
    clienteDpi,
    clienteNit,
    clienteDireccion,
    vendedor,
    metodoPago,
    tipoComprobante,

    totalCarrito,
    totalDescuento,
    totalConDescuento,
    cuotas,
    cantidadPorCuota,
    enganche,
    comentario,
    formatCurrency,
    costos_adicionales,
    cotizacion,
    credito,

    subtotalProductos,
    subtotalConDescuento,
    totalCostosAdicionales,
    totalContado,

    baseFinanciable,
    saldoAntesInteres,
    totalInteres,
    totalFinanciado,
    pagoInicialTotal,
    totalCreditoEstimado,
    observaciones,
  } = props;

  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadLogo = async () => {
      try {
        if (!logoUrl) return;

        const dataUrl = await imageUrlToDataUrl(logoUrl);

        if (!cancelled) {
          setLogoDataUrl(dataUrl);
        }
      } catch (error) {
        console.error("Error cargando logo de cotización:", error);

        if (!cancelled) {
          setLogoDataUrl(null);
        }
      }
    };

    loadLogo();

    return () => {
      cancelled = true;
    };
  }, []);

  const totals = useMemo(() => {
    const additional = Number.isFinite(totalCostosAdicionales)
      ? Number(totalCostosAdicionales)
      : costos_adicionales.reduce(
          (acc, costo) => acc + (Number(costo.costo) || 0),
          0,
        );

    const productsSubtotal = Number.isFinite(subtotalProductos)
      ? Number(subtotalProductos)
      : Number(totalCarrito) || 0;

    const discountedSubtotal = Number.isFinite(subtotalConDescuento)
      ? Number(subtotalConDescuento)
      : Number(totalConDescuento) || 0;

    const contado = Number.isFinite(totalContado)
      ? Number(totalContado)
      : discountedSubtotal + additional;

    return {
      additional,
      productsSubtotal,
      discountedSubtotal,
      contado,
    };
  }, [
    costos_adicionales,
    subtotalProductos,
    subtotalConDescuento,
    totalCarrito,
    totalConDescuento,
    totalCostosAdicionales,
    totalContado,
  ]);

  const today = new Date();
  const fallbackFechaEmision = toISODate(today);
  const fallbackValidezDias = 7;
  const fallbackFechaVencimiento = addDaysISO(fallbackValidezDias);

  const numeroCotizacion = cotizacion?.numeroCotizacion ?? `COT-${Date.now()}`;
  const fechaEmision = cotizacion?.fechaEmision ?? fallbackFechaEmision;
  const fechaVencimiento =
    cotizacion?.fechaVencimiento ?? fallbackFechaVencimiento;
  const validezDias = cotizacion?.validezDias ?? fallbackValidezDias;
  const tiempoEntrega =
    cotizacion?.tiempoEntrega ?? "Entrega inmediata salvo falta de stock.";
  const garantia =
    cotizacion?.garantia ?? "Garantía según políticas de la empresa.";
  const condiciones =
    cotizacion?.condiciones ??
    "Cotización sujeta a disponibilidad de inventario. Precios válidos únicamente durante el período indicado.";
  const estado = cotizacion?.estado ?? "GENERADA";

  const isCredit = Boolean(
    credito || cuotas > 0 || metodoPago?.toUpperCase?.().includes("CREDITO"),
  );

  const creditoResolved: CreditoPrintConfig = {
    cuotas: credito?.cuotas ?? cuotas ?? 0,
    enganche: credito?.enganche ?? enganche ?? 0,
    tasaInteres: credito?.tasaInteres ?? 0,
    gastosAdministrativos: credito?.gastosAdministrativos ?? 0,
    frecuenciaPago: credito?.frecuenciaPago ?? "MENSUAL",
    fechaPrimerPago: credito?.fechaPrimerPago ?? "",
    incluirCostosEnCredito: credito?.incluirCostosEnCredito ?? true,
    requiereAprobacion: credito?.requiereAprobacion ?? true,
  };

  const printSaldoAntesInteres =
    saldoAntesInteres ??
    Math.max(
      (baseFinanciable ?? totals.discountedSubtotal) -
        creditoResolved.enganche +
        creditoResolved.gastosAdministrativos,
      0,
    );

  const printTotalInteres =
    totalInteres ??
    printSaldoAntesInteres * ((creditoResolved.tasaInteres || 0) / 100);

  const printTotalFinanciado =
    totalFinanciado ?? printSaldoAntesInteres + printTotalInteres;

  const printCantidadPorCuota =
    cantidadPorCuota ||
    (creditoResolved.cuotas > 0
      ? printTotalFinanciado / creditoResolved.cuotas
      : 0);

  const printPagoInicial =
    pagoInicialTotal ?? creditoResolved.enganche ?? enganche ?? 0;

  const printTotalCreditoEstimado =
    totalCreditoEstimado ?? printPagoInicial + printTotalFinanciado;

  const VERDE = "#2DBE8D";
  const VERDE2 = "#7ED8B8";
  const VERDE_SUAVE = "#eefaf6";
  const GRIS = "#555";
  const GRIS_CLARO = "#f6f7f8";
  const BORDE = "#dfe7e4";
  const ROJO = "#b42318";

  return (
    <div
      ref={ref}
      style={{
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
        fontFamily: "Arial, sans-serif",
        fontSize: "11px",
        color: "#111",
        backgroundColor: "#fff",
        padding: "28px",
        maxWidth: "820px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          height: "8px",
          backgroundColor: VERDE2,
          marginBottom: "18px",
          borderRadius: "2px",
        }}
      />

      {/* HEADER */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 170px",
          gap: "16px",
          alignItems: "start",
          marginBottom: "18px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 900,
              color: VERDE,
              margin: 0,
              lineHeight: 1.1,
              textTransform: "uppercase",
            }}
          >
            {sucursal.nombre ?? "N/A"}
          </h1>

          <p
            style={{
              margin: "6px 0 0",
              color: GRIS,
              fontSize: "10.5px",
              lineHeight: 1.5,
            }}
          >
            {sucursal.direccion ?? "N/A"}
            <br />
            Contacto: {sucursal.telefono ?? "N/A"}
            {sucursal.pbx ? ` · PBX: ${sucursal.pbx}` : ""}
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
          {logoDataUrl && (
            <img
              src={logoDataUrl}
              alt="Logo"
              style={{
                height: "58px",
                width: "auto",
                objectFit: "contain",
                marginBottom: "8px",
              }}
            />
          )}

          <div
            style={{
              border: `1px solid ${BORDE}`,
              borderRadius: "6px",
              overflow: "hidden",
              textAlign: "left",
            }}
          >
            <div
              style={{
                backgroundColor: VERDE,
                color: "#fff",
                padding: "6px 8px",
                fontWeight: 800,
                fontSize: "12px",
                textTransform: "uppercase",
              }}
            >
              Cotización
            </div>

            <div style={{ padding: "7px 8px", fontSize: "10.5px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: GRIS }}>No.</span>
                <strong>{numeroCotizacion}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: GRIS }}>Estado</span>
                <strong>{estado}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GENERAL INFO */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: "10px",
          marginBottom: "14px",
        }}
      >
        <div
          style={{
            border: `1px solid ${BORDE}`,
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              backgroundColor: VERDE_SUAVE,
              padding: "6px 8px",
              fontWeight: 800,
              color: VERDE,
              textTransform: "uppercase",
            }}
          >
            Cliente
          </div>

          <div style={{ padding: "8px", lineHeight: 1.55 }}>
            <div>
              <span style={{ color: GRIS }}>Nombre: </span>
              <strong>{cliente || "Consumidor final"}</strong>
            </div>

            {(clienteTelefono ||
              clienteDpi ||
              clienteNit ||
              clienteDireccion) && (
              <>
                {clienteTelefono && (
                  <div>
                    <span style={{ color: GRIS }}>Teléfono: </span>
                    {clienteTelefono}
                  </div>
                )}
                {clienteDpi && (
                  <div>
                    <span style={{ color: GRIS }}>DPI: </span>
                    {clienteDpi}
                  </div>
                )}
                {clienteNit && (
                  <div>
                    <span style={{ color: GRIS }}>NIT: </span>
                    {clienteNit}
                  </div>
                )}
                {clienteDireccion && (
                  <div>
                    <span style={{ color: GRIS }}>Dirección: </span>
                    {clienteDireccion}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div
          style={{
            border: `1px solid ${BORDE}`,
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              backgroundColor: VERDE_SUAVE,
              padding: "6px 8px",
              fontWeight: 800,
              color: VERDE,
              textTransform: "uppercase",
            }}
          >
            Datos de cotización
          </div>

          <div style={{ padding: "8px", lineHeight: 1.55 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: GRIS }}>Emisión</span>
              <strong>{toDateLabel(fechaEmision)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: GRIS }}>Vence</span>
              <strong>{toDateLabel(fechaVencimiento)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: GRIS }}>Validez</span>
              <strong>{validezDias} día(s)</strong>
            </div>
            {vendedor && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: GRIS }}>Vendedor</span>
                <strong>{vendedor}</strong>
              </div>
            )}
            {metodoPago && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: GRIS }}>Método</span>
                <strong>{metodoPago}</strong>
              </div>
            )}
            {tipoComprobante && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: GRIS }}>Comprobante</span>
                <strong>{tipoComprobante}</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ITEMS */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "12px",
          fontSize: "10.5px",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: VERDE, color: "#fff" }}>
            <th style={{ ...tableHeadCell, textAlign: "left" }}>Producto</th>
            <th style={{ ...tableHeadCell, textAlign: "center", width: 46 }}>
              Cant.
            </th>
            <th style={{ ...tableHeadCell, textAlign: "right", width: 90 }}>
              Precio
            </th>
            <th style={{ ...tableHeadCell, textAlign: "right", width: 96 }}>
              Total
            </th>
          </tr>
        </thead>

        <tbody>
          {cart.map((item, index) => {
            const lineTotal =
              Number(item.selectedPrice || 0) * Number(item.quantity || 1);

            return (
              <tr
                key={item.uid}
                style={{
                  backgroundColor: index % 2 === 0 ? "#f8fbfa" : "#fff",
                }}
              >
                <td style={tableCell}>
                  <strong>{item.nombre}</strong>
                  {item.selectedPriceRole && (
                    <div style={{ color: GRIS, fontSize: "9.5px" }}>
                      Precio: {String(item.selectedPriceRole)}
                    </div>
                  )}
                </td>

                <td style={{ ...tableCell, textAlign: "center" }}>
                  {item.quantity}
                </td>

                <td style={{ ...tableCell, textAlign: "right" }}>
                  {formatCurrency(Number(item.selectedPrice || 0))}
                </td>

                <td
                  style={{ ...tableCell, textAlign: "right", fontWeight: 700 }}
                >
                  {formatCurrency(lineTotal)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ADDITIONAL COSTS */}
      {costos_adicionales.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "12px",
            fontSize: "10.5px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: VERDE2, color: "#111" }}>
              <th style={{ ...tableHeadCell, textAlign: "left" }}>
                Costos adicionales
              </th>
              <th style={{ ...tableHeadCell, textAlign: "left" }}>
                Descripción
              </th>
              <th style={{ ...tableHeadCell, textAlign: "center", width: 85 }}>
                Condición
              </th>
              <th style={{ ...tableHeadCell, textAlign: "right", width: 90 }}>
                Monto
              </th>
            </tr>
          </thead>

          <tbody>
            {costos_adicionales.map((item, index) => (
              <tr
                key={item.id}
                style={{
                  backgroundColor: index % 2 === 0 ? "#f8fbfa" : "#fff",
                }}
              >
                <td style={tableCell}>
                  <strong>{item.nombre_costo}</strong>
                </td>

                <td style={{ ...tableCell, color: GRIS }}>
                  {item.descripcion || "—"}
                </td>

                <td
                  style={{
                    ...tableCell,
                    textAlign: "center",
                    fontSize: "9.5px",
                  }}
                >
                  {item.obligatorio ? "Obligatorio" : "Opcional"}
                  {item.financiable ? " · Financiable" : ""}
                </td>

                <td
                  style={{ ...tableCell, textAlign: "right", fontWeight: 700 }}
                >
                  {formatCurrency(Number(item.costo || 0))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* TOTALS + NOTES */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isCredit ? "1fr 1fr" : "1fr 260px",
          gap: "12px",
          alignItems: "start",
          marginTop: "10px",
        }}
      >
        <div style={{ display: "grid", gap: "8px" }}>
          <div
            style={{
              border: `1px solid ${BORDE}`,
              borderRadius: "6px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                backgroundColor: VERDE_SUAVE,
                padding: "6px 8px",
                fontWeight: 800,
                color: VERDE,
                textTransform: "uppercase",
              }}
            >
              Condiciones comerciales
            </div>

            <div
              style={{ padding: "8px", fontSize: "10.5px", lineHeight: 1.55 }}
            >
              <div>
                <strong>Entrega:</strong> {tiempoEntrega}
              </div>
              <div>
                <strong>Garantía:</strong> {garantia}
              </div>
              <div>
                <strong>Condiciones:</strong> {condiciones}
              </div>
            </div>
          </div>

          {(comentario || observaciones) && (
            <div
              style={{
                border: `1px solid ${BORDE}`,
                borderRadius: "6px",
                padding: "8px",
                fontSize: "10.5px",
                color: GRIS,
                lineHeight: 1.55,
              }}
            >
              <strong style={{ color: "#111" }}>Notas:</strong>
              <br />
              {comentario || observaciones}
            </div>
          )}
        </div>

        <div
          style={{
            border: `1px solid ${BORDE}`,
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              backgroundColor: VERDE,
              color: "#fff",
              padding: "6px 8px",
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            Resumen
          </div>

          <div style={{ padding: "8px", fontSize: "10.5px" }}>
            <SummaryRow
              label="Subtotal productos"
              value={formatCurrency(totals.productsSubtotal)}
            />

            {totalDescuento > 0 && (
              <SummaryRow
                label="Descuento"
                value={`- ${formatCurrency(totalDescuento)}`}
                color={ROJO}
              />
            )}

            <SummaryRow
              label="Subtotal con descuento"
              value={formatCurrency(totals.discountedSubtotal)}
            />

            {totals.additional > 0 && (
              <SummaryRow
                label="Costos adicionales"
                value={formatCurrency(totals.additional)}
              />
            )}

            <div
              style={{
                marginTop: "6px",
                paddingTop: "6px",
                borderTop: `2px solid ${VERDE}`,
              }}
            >
              <SummaryRow
                label="Total contado"
                value={formatCurrency(totals.contado)}
                strong
              />
            </div>
          </div>
        </div>
      </div>

      {/* CREDIT BLOCK */}
      {isCredit && (
        <div
          style={{
            marginTop: "12px",
            border: `1px solid ${BORDE}`,
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              backgroundColor: "#183b32",
              color: "#fff",
              padding: "7px 8px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.4px",
            }}
          >
            Condiciones de crédito
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "8px",
              padding: "9px 10px",
              fontSize: "10.5px",
              backgroundColor: GRIS_CLARO,
            }}
          >
            <CreditInfo
              label="Frecuencia"
              value={frecuenciaLabel[creditoResolved.frecuenciaPago]}
            />
            <CreditInfo
              label="Primer pago"
              value={
                creditoResolved.fechaPrimerPago
                  ? toDateLabel(creditoResolved.fechaPrimerPago)
                  : "Por definir"
              }
            />
            <CreditInfo
              label="Aprobación"
              value={
                creditoResolved.requiereAprobacion
                  ? "Sujeto a aprobación"
                  : "No indicada"
              }
            />
          </div>

          <div style={{ padding: "8px 10px", fontSize: "10.5px" }}>
            <SummaryRow
              label="Base financiable"
              value={formatCurrency(
                baseFinanciable ?? totals.discountedSubtotal,
              )}
            />
            <SummaryRow
              label="Enganche"
              value={formatCurrency(creditoResolved.enganche)}
            />
            <SummaryRow
              label="Gastos administrativos"
              value={formatCurrency(creditoResolved.gastosAdministrativos)}
            />
            <SummaryRow
              label="Saldo antes de recargo"
              value={formatCurrency(printSaldoAntesInteres)}
            />
            <SummaryRow
              label={`Recargo / interés (${creditoResolved.tasaInteres}%)`}
              value={formatCurrency(printTotalInteres)}
            />

            <div
              style={{
                marginTop: "6px",
                paddingTop: "6px",
                borderTop: `2px solid ${VERDE}`,
              }}
            >
              <SummaryRow
                label="Pago inicial estimado"
                value={formatCurrency(printPagoInicial)}
                strong
              />
              <SummaryRow
                label="Total financiado"
                value={formatCurrency(printTotalFinanciado)}
                strong
              />
              <SummaryRow
                label={`${creditoResolved.cuotas} cuota(s) ${frecuenciaLabel[
                  creditoResolved.frecuenciaPago
                ].toLowerCase()} de`}
                value={formatCurrency(printCantidadPorCuota)}
                strong
              />
              <SummaryRow
                label="Total estimado crédito"
                value={formatCurrency(printTotalCreditoEstimado)}
                strong
              />
            </div>

            {creditoResolved.requiereAprobacion && (
              <p
                style={{
                  margin: "8px 0 0",
                  color: ROJO,
                  fontSize: "10px",
                  lineHeight: 1.45,
                }}
              >
                * Esta cotización de crédito está sujeta a verificación,
                disponibilidad, revisión de datos del cliente y aprobación
                interna.
              </p>
            )}
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          marginTop: "32px",
          fontSize: "10px",
          color: GRIS,
        }}
      >
        <div style={{ borderTop: "1px solid #999", paddingTop: "6px" }}>
          Firma vendedor
        </div>

        <div style={{ borderTop: "1px solid #999", paddingTop: "6px" }}>
          Firma cliente
        </div>
      </div>

      <div
        style={{
          height: "6px",
          backgroundColor: VERDE2,
          marginTop: "24px",
          borderRadius: "2px",
        }}
      />
    </div>
  );
});

function SummaryRow({
  label,
  value,
  color,
  strong = false,
}: {
  label: string;
  value: string;
  color?: string;
  strong?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "12px",
        padding: strong ? "4px 0" : "3px 0",
        borderBottom: strong ? "none" : "1px solid #ececec",
        color: color ?? "#111",
      }}
    >
      <span style={{ color: color ?? "#555", fontWeight: strong ? 800 : 400 }}>
        {label}
      </span>
      <span style={{ fontWeight: strong ? 900 : 700, textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}

function CreditInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          color: "#555",
          fontSize: "9.5px",
          textTransform: "uppercase",
          letterSpacing: "0.3px",
        }}
      >
        {label}
      </div>
      <strong>{value}</strong>
    </div>
  );
}

CotizacionPrint.displayName = "CotizacionPrint";

export default CotizacionPrint;
