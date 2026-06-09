import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";
const logoUrl = import.meta.env.VITE_APP_LOGO;

interface Props {
  valor: string;
  includeLogo?: boolean;
}

export const GeneradorQR = ({ valor, includeLogo = false }: Props) => {
  const qrRef = useRef<HTMLCanvasElement>(null);

  const log: string = includeLogo ? logoUrl : "";

  const descargarQR = () => {
    const canvas = qrRef.current;
    if (!canvas) return;

    // Convertir a Data URL (base64)
    const imagenBase64 = canvas.toDataURL("image/png");

    // Opción A: Descargar directamente
    const link = document.createElement("a");
    link.href = imagenBase64;
    link.download = `qr-producto-${valor}.png`;
    link.click();

    // Opción B: Persistir (Enviar al backend/Prisma)
    // Aquí podrías enviar 'imagenBase64' a una API de NestJS para guardarlo
    console.log("Listo para persistir:", imagenBase64);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      <QRCodeCanvas
        ref={qrRef}
        value={valor}
        size={256}
        bgColor={"#ffffff"}
        fgColor={"#000000"}
        level={"H"}
        includeMargin={true}
        imageSettings={{
          src: log,
          height: 40,
          width: 40,
          excavate: true,
        }}
      />

      <button onClick={descargarQR} className="btn-save">
        Descargar QR
      </button>
    </div>
  );
};
