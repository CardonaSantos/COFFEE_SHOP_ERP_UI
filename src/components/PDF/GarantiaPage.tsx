"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import dayjs from "dayjs";
import "dayjs/locale/es";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { toast } from "sonner";
import { VentaHistorialPDF } from "@/Types/PDF/VentaHistorialPDF";
import { PageHeader } from "@/utils/components/PageHeaderPos";

dayjs.extend(localizedFormat);
dayjs.locale("es");

const API_URL = import.meta.env.VITE_API_URL;
const logoUrl = import.meta.env.VITE_APP_LOGO;

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

async function waitForImages(element: HTMLElement) {
  const images = Array.from(element.querySelectorAll("img"));

  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }

          img.onload = () => resolve();
          img.onerror = () => resolve();
        }),
    ),
  );
}

function formatearFecha(fecha?: string | Date | null) {
  if (!fecha) return "No disponible";
  return dayjs(fecha).format("DD/MM/YYYY");
}

function getClienteNombre(venta: VentaHistorialPDF) {
  const nombreCompleto = [venta.cliente?.nombre, venta.cliente?.apellidos]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ");

  return nombreCompleto || venta.nombreClienteFinal || "No disponible";
}

function GarantiaPage() {
  const { id } = useParams();

  const garantiaRef = useRef<HTMLDivElement>(null);

  const [venta, setVenta] = useState<VentaHistorialPDF>();
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoReady, setLogoReady] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const getSale = async () => {
      try {
        if (!id) return;

        const response = await axios.get<VentaHistorialPDF>(
          `${API_URL}/venta/get-sale/${id}`,
        );

        if (!cancelled) {
          setVenta(response.data);
        }
      } catch (error) {
        toast.error("Error al encontrar registro de venta");
      }
    };

    getSale();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    const loadLogo = async () => {
      try {
        if (!logoUrl) {
          setLogoReady(true);
          return;
        }

        const dataUrl = await imageUrlToDataUrl(logoUrl);

        if (!cancelled) {
          setLogoDataUrl(dataUrl);
          setLogoReady(true);
        }
      } catch (error) {
        console.error("Error cargando logo:", error);

        if (!cancelled) {
          setLogoDataUrl(null);
          setLogoReady(true);
        }
      }
    };

    loadLogo();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!venta || !logoReady || !garantiaRef.current) return;

    let revoked = false;

    const generarPDF = async () => {
      try {
        const container = garantiaRef.current;

        if (!container) return;

        await waitForImages(container);

        await new Promise((resolve) => {
          requestAnimationFrame(() => resolve(null));
        });

        const pages = Array.from(
          container.querySelectorAll<HTMLElement>("[data-pdf-page='true']"),
        );

        if (pages.length === 0) return;

        const pdf = new jsPDF({
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        });

        for (let index = 0; index < pages.length; index++) {
          const page = pages[index];

          const canvas = await html2canvas(page, {
            scale: 1.5,
            useCORS: true,
            allowTaint: false,
            backgroundColor: "#ffffff",
            logging: false,
          });

          const imgData = canvas.toDataURL("image/png");
          const imgWidth = 210;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          if (index > 0) {
            pdf.addPage();
          }

          pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        }

        const blob = pdf.output("blob");

        if (!revoked) {
          setPdfUrl(URL.createObjectURL(blob));
        }
      } catch (error) {
        console.error("Error al generar garantía PDF:", error);
      }
    };

    generarPDF();

    return () => {
      revoked = true;
    };
  }, [venta, logoReady]);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  if (!venta || !logoReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-center text-xl font-extrabold">Cargando PDF</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <PageHeader title="Garantía" fallbackBackTo="/" sticky={false} />

      {pdfUrl && (
        <a
          href={pdfUrl}
          download={`Garantia_${venta.id}.pdf`}
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 font-semibold text-white shadow-lg shadow-amber-300/50 transition-all duration-200 hover:bg-amber-600 active:scale-95"
        >
          Descargar
        </a>
      )}

      <div
        ref={garantiaRef}
        className={pdfUrl ? "hidden" : "block"}
        style={{
          width: "210mm",
          margin: "0 auto",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
        }}
      >
        {venta.productos.map((producto: any, index: number) => (
          <div
            key={producto.id ?? index}
            data-pdf-page="true"
            className="mb-6 bg-white text-[#1E1E1E]"
            style={{
              width: "210mm",
              minHeight: "297mm",
              padding: "18mm",
              fontSize: "10px",
              lineHeight: 1.4,
            }}
          >
            <header className="mb-4 flex flex-col items-center text-center">
              {logoDataUrl && (
                <img
                  src={logoDataUrl}
                  className="mb-1 h-[50px] w-[90px] object-contain"
                  alt="Logo"
                />
              )}

              <h1 className="text-base font-bold text-[#2ECC9A]">
                CERTIFICADO DE GARANTÍA
              </h1>

              <p className="text-xs text-[#666666]">
                {venta.sucursal?.nombre || "Sucursal no disponible"}
              </p>
            </header>

            <div className="my-3 h-px w-full bg-[#DDEEE8]" />

            <section className="mb-3 border-l-[3px] border-[#2ECC9A] pl-2">
              <h2 className="mb-2 bg-[#F7F9F9] p-1 text-[11px] font-bold text-[#1FA97A]">
                DETALLES DE LA VENTA
              </h2>

              <InfoRow label="No. Garantía:" value={`#${venta.id}`} />

              <InfoRow
                label="Fecha de Compra:"
                value={formatearFecha(venta.fechaVenta)}
              />
            </section>

            <section className="mb-3 border-l-[3px] border-[#2ECC9A] pl-2">
              <h2 className="mb-2 bg-[#F7F9F9] p-1 text-[11px] font-bold text-[#1FA97A]">
                INFORMACIÓN DEL PRODUCTO
              </h2>

              <InfoRow
                label="Producto:"
                value={producto?.producto?.nombre || "No disponible"}
              />

              <InfoRow
                label="Descripción:"
                value={producto?.producto?.descripcion || "No disponible"}
              />

              <InfoRow label="Cantidad:" value={producto?.cantidad || "1"} />
            </section>

            <section className="mb-3 border-l-[3px] border-[#2ECC9A] pl-2">
              <h2 className="mb-2 bg-[#F7F9F9] p-1 text-[11px] font-bold text-[#1FA97A]">
                INFORMACIÓN DEL CLIENTE
              </h2>

              <InfoRow label="Nombre:" value={getClienteNombre(venta)} />

              <InfoRow
                label="DPI/NIT:"
                value={venta.cliente?.dpi || "No disponible"}
              />

              <InfoRow
                label="Teléfono:"
                value={
                  venta.cliente?.telefono ||
                  venta.telefonoClienteFinal ||
                  "No disponible"
                }
              />

              <InfoRow
                label="Dirección:"
                value={
                  venta.cliente?.direccion ||
                  venta.direccionClienteFinal ||
                  "No disponible"
                }
              />
            </section>

            <section className="mt-2 border border-[#2ECC9A] bg-[#F7F9F9] p-2">
              <h2 className="mb-2 bg-[#F7F9F9] p-1 text-[11px] font-bold text-[#1FA97A]">
                TÉRMINOS Y CONDICIONES DE LA GARANTÍA
              </h2>

              {[
                "Esta garantía cubre defectos de fabricación y materiales bajo condiciones normales de uso.",
                "La garantía NO cubre daños causados por mal uso, abuso, accidentes, desgaste normal o modificaciones no autorizadas.",
                "Para hacer válida la garantía, debe presentar este certificado junto con la factura de compra original.",
                "Las herramientas eléctricas requieren revisión técnica para determinar si aplica la garantía.",
                "Los productos de consumo tienen garantía limitada solo por defectos evidentes de fabricación.",
              ].map((term, idx) => (
                <p key={idx} className="mt-1 text-[9px]">
                  {idx + 1}. {term}
                </p>
              ))}
            </section>

            <section className="mt-5 text-center text-[10px]">
              <p>
                Confirmo haber recibido el producto en buen estado y acepto los
                términos de garantía descritos en este documento.
              </p>

              <div className="mx-auto mt-8 w-[70%] border-t border-[#1E1E1E]" />

              <p className="mt-1">Firma del Cliente</p>
            </section>

            <footer className="mt-4 text-center text-[9px] text-[#666666]">
              <p>
                Por favor, conserve este certificado junto con su factura para
                hacer válida la garantía.
              </p>
            </footer>
          </div>
        ))}
      </div>

      {pdfUrl && (
        <div className="mt-6">
          <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <iframe
              src={pdfUrl}
              className="h-[80vh] w-full rounded border border-slate-200"
              title="Vista previa de garantía"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="mb-1 flex">
      <span className="w-[40%] font-bold text-[#666666]">{label}</span>
      <span className="w-[60%] text-[#1E1E1E]">{value || "No disponible"}</span>
    </div>
  );
}

export default GarantiaPage;
