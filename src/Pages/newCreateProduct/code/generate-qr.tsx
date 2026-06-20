import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";

const logoUrl = import.meta.env.VITE_APP_LOGO;

interface GeneradorQRProps {
  valor: string;
  includeLogo?: boolean;
}

export function GeneradorQR({ valor, includeLogo = false }: GeneradorQRProps) {
  const qrRef = useRef<HTMLCanvasElement>(null);
  const exportQrRef = useRef<HTMLCanvasElement>(null);

  const descargarQR = () => {
    const canvas = exportQrRef.current ?? qrRef.current;
    if (!canvas) return;

    const imagenBase64 = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = imagenBase64;
    link.download = `qr-producto-${valor || "sin-codigo"}.png`;
    link.click();

    console.log("QR listo para persistir:", imagenBase64);
  };

  const imageSettings = includeLogo
    ? {
        src: logoUrl,
        height: 28,
        width: 28,
        excavate: true,
      }
    : undefined;

  const exportImageSettings = includeLogo
    ? {
        src: logoUrl,
        height: 90,
        width: 90,
        excavate: true,
      }
    : undefined;

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="flex items-center justify-center rounded-md bg-white p-2">
        <QRCodeCanvas
          ref={qrRef}
          value={valor || "placeholder"}
          size={132}
          bgColor="#ffffff"
          fgColor="#000000"
          level="H"
          includeMargin
          imageSettings={imageSettings}
        />
      </div>

      <div className="hidden">
        <QRCodeCanvas
          ref={exportQrRef}
          value={valor || "placeholder"}
          size={512}
          bgColor="#ffffff"
          fgColor="#000000"
          level="H"
          includeMargin
          imageSettings={exportImageSettings}
        />
      </div>

      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7 px-2 text-xs"
        onClick={descargarQR}
      >
        Descargar QR
      </Button>
    </div>
  );
}
