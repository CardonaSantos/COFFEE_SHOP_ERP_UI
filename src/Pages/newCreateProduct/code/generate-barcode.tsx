import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

import { Button } from "@/components/ui/button";

interface GeneradorBarrasProps {
  valor: string;
  format?: "CODE128" | "EAN13" | "EAN8" | "UPC" | "CODE39" | "ITF14";
  displayValue?: boolean;
}

export function GeneradorBarras({
  valor,
  format = "CODE128",
  displayValue = true,
}: GeneradorBarrasProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const safeValue = valor?.trim() || "placeholder";

    try {
      JsBarcode(svgRef.current, safeValue, {
        format,
        width: 1.15,
        height: 46,
        margin: 4,
        fontSize: 10,
        displayValue,
        lineColor: "#000000",
        background: "#ffffff",
      });
    } catch (error) {
      console.error("Error generando código de barras:", error);
    }
  }, [valor, format, displayValue]);

  const descargarBarras = () => {
    const safeValue = valor?.trim() || "placeholder";

    const exportSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );

    JsBarcode(exportSvg, safeValue, {
      format,
      width: 2,
      height: 90,
      margin: 14,
      fontSize: 18,
      displayValue,
      lineColor: "#000000",
      background: "#ffffff",
    });

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(exportSvg);

    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");

      canvas.width = image.width || 700;
      canvas.height = image.height || 220;

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        URL.revokeObjectURL(url);
        return;
      }

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);

      const imagenBase64 = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = imagenBase64;
      link.download = `barras-producto-${safeValue}.png`;
      link.click();

      console.log("Código de barras listo para persistir:", imagenBase64);

      URL.revokeObjectURL(url);
    };

    image.src = url;
  };

  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-2">
      <div className="flex max-w-full justify-center overflow-x-auto rounded-md bg-white p-2">
        <svg ref={svgRef} className="max-w-full" />
      </div>

      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7 px-2 text-xs"
        onClick={descargarBarras}
      >
        Descargar barras
      </Button>
    </div>
  );
}
