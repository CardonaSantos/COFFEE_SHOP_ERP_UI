import { forwardRef, useEffect, useState } from "react";
import { costoAdicional } from "../page";
import { CartItem } from "@/Types/POS/interfaces";
import { Sucursal } from "@/Types/Sucursal/Sucursal_Info";

const logoUrl = import.meta.env.VITE_APP_LOGO;

interface Props {
  cart: CartItem[];
  cliente: string;
  totalCarrito: number;
  totalDescuento: number;
  totalConDescuento: number;
  cuotas: number;
  cantidadPorCuota: number;
  enganche: number;
  comentario: string;
  formatCurrency: (n: number) => string;
  costos_adicionales: Array<costoAdicional>;
  sucursal: Sucursal;
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

const CotizacionPrint = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const {
    cart,
    sucursal,
    cliente,
    totalCarrito,
    totalDescuento,
    totalConDescuento,
    cuotas,
    cantidadPorCuota,
    enganche,
    comentario,
    formatCurrency,
    costos_adicionales,
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

  const today = new Date();
  const fechaStr = today.toLocaleDateString("es-GT");

  const ROJO = "#F5F5F5";
  const VERDE = "#2DBE8D";
  const VERDE2 = "#7ED8B8";

  return (
    <div
      ref={ref}
      style={{
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        color: "#111",
        backgroundColor: "#fff",
        padding: "32px",
        maxWidth: "780px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          height: "10px",
          backgroundColor: VERDE2,
          marginBottom: "20px",
          borderRadius: "2px",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "25px",
              fontWeight: 800,
              color: VERDE,
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {sucursal.nombre ?? "N/A"}
          </h1>

          <p
            style={{
              margin: "6px 0 0",
              color: "#555",
              fontSize: "11px",
              lineHeight: 1.6,
            }}
          >
            {sucursal.direccion ?? "N/A"}
            <br />
            Contacto: {sucursal.telefono ?? "N/A"} &nbsp; PBX: {sucursal.pbx}
          </p>
        </div>

        {logoDataUrl && (
          <img
            src={logoDataUrl}
            alt="Logo Nova Sistemas"
            style={{
              height: "72px",
              width: "auto",
              objectFit: "contain",
            }}
          />
        )}
      </div>

      <div style={{ marginBottom: "16px" }}>
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 900,
            color: VERDE,
            textTransform: "uppercase",
            letterSpacing: "1px",
            borderBottom: `2px solid ${VERDE}`,
            paddingBottom: "4px",
            display: "inline-block",
            margin: 0,
          }}
        >
          Detalle de Cotización
        </h2>

        {cliente && (
          <p style={{ margin: "6px 0 0", fontSize: "11px", color: "#555" }}>
            Cliente: <strong>{cliente}</strong>
          </p>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "8px",
          marginBottom: "24px",
        }}
      >
        {[{ label: "FECHA:", value: fechaStr }].map(({ label, value }) => (
          <div key={label}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "11px" }}>
              {label}
            </p>

            <p
              style={{
                margin: 0,
                color: ROJO,
                fontWeight: 700,
                fontSize: "13px",
              }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "16px",
          fontSize: "11px",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: VERDE, color: "#fff" }}>
            <th
              style={{
                padding: "7px 8px",
                textAlign: "left",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Producto
            </th>

            <th
              style={{
                padding: "7px 8px",
                textAlign: "right",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              Precio
            </th>

            <th
              style={{
                padding: "7px 8px",
                textAlign: "right",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              Cantidad
            </th>

            <th
              style={{
                padding: "7px 8px",
                textAlign: "right",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              Total
            </th>
          </tr>
        </thead>

        <tbody>
          {cart.map((item, i) => (
            <tr
              key={item.uid}
              style={{ backgroundColor: i % 2 === 0 ? "#f4f9f6" : "#fff" }}
            >
              <td style={{ padding: "6px 8px" }}>{item.nombre}</td>

              <td style={{ padding: "6px 8px", textAlign: "right" }}>
                {formatCurrency(item.selectedPrice)}
              </td>

              <td style={{ padding: "6px 8px", textAlign: "right" }}>
                {item.quantity}
              </td>

              <td style={{ padding: "6px 8px", textAlign: "right" }}>
                {formatCurrency(item.selectedPrice * item.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {costos_adicionales.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "16px",
            fontSize: "11px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: VERDE2, color: "#fff" }}>
              <th
                style={{
                  padding: "7px 8px",
                  textAlign: "left",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                Otros
              </th>

              <th
                style={{
                  padding: "7px 8px",
                  textAlign: "right",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                Monto
              </th>

              <th
                style={{
                  padding: "7px 8px",
                  textAlign: "right",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                Descripción
              </th>
            </tr>
          </thead>

          <tbody>
            {costos_adicionales.map((item, i) => (
              <tr
                key={item.id}
                style={{ backgroundColor: i % 2 === 0 ? "#f4f9f6" : "#fff" }}
              >
                <td style={{ padding: "6px 8px" }}>{item.nombre_costo}</td>

                <td style={{ padding: "6px 8px", textAlign: "right" }}>
                  {formatCurrency(item.costo)}
                </td>

                <td
                  style={{
                    padding: "6px 8px",
                    textAlign: "right",
                    color: "#555",
                  }}
                >
                  {item.descripcion}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginTop: "8px",
        }}
      >
        <div style={{ fontSize: "11px", color: "#555", maxWidth: "55%" }}>
          {comentario && (
            <>
              <p style={{ fontWeight: 700, margin: "0 0 2px" }}>Notas:</p>
              <p style={{ margin: 0 }}>{comentario}</p>
            </>
          )}
        </div>

        <div style={{ minWidth: "220px", fontSize: "11px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "3px 0",
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            <span style={{ color: "#555" }}>Subtotal</span>
            <span>{formatCurrency(totalCarrito)}</span>
          </div>

          {totalDescuento > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "3px 0",
                borderBottom: "1px solid #e0e0e0",
                color: ROJO,
              }}
            >
              <span>Descuento</span>
              <span>- {formatCurrency(totalDescuento)}</span>
            </div>
          )}

          {costos_adicionales.length > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "3px 0",
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <span style={{ color: "#555" }}>Costos adicionales</span>
              <span>
                {formatCurrency(
                  costos_adicionales.reduce(
                    (acc, costo) => acc + costo.costo,
                    0,
                  ),
                )}
              </span>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0 2px",
              marginTop: "4px",
              borderTop: `2px solid ${VERDE}`,
            }}
          >
            <span
              style={{
                fontWeight: 900,
                fontSize: "15px",
                color: ROJO,
                textTransform: "uppercase",
              }}
            >
              Total
            </span>

            <span style={{ fontWeight: 900, fontSize: "15px", color: ROJO }}>
              {formatCurrency(
                totalConDescuento +
                  costos_adicionales.reduce(
                    (acc, costo) => acc + costo.costo,
                    0,
                  ),
              )}
            </span>
          </div>

          {cuotas > 0 && (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "3px 0",
                  color: "#555",
                }}
              >
                <span>Enganche</span>
                <span>{formatCurrency(enganche)}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "3px 0",
                  color: "#555",
                }}
              >
                <span>{cuotas} cuotas de</span>
                <span>{formatCurrency(cantidadPorCuota)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div
        style={{
          height: "6px",
          backgroundColor: VERDE2,
          marginTop: "28px",
          borderRadius: "2px",
        }}
      />
    </div>
  );
});

CotizacionPrint.displayName = "CotizacionPrint";

export default CotizacionPrint;
