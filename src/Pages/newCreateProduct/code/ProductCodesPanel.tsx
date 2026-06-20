import { useState } from "react";
import { Barcode, QrCode } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { GeneradorQR } from "./generate-qr";
import { GeneradorBarras } from "./generate-barcode";

type CodeTab = "qr" | "barcode";

interface ProductCodesPanelProps {
  codigoProducto: string;
  includeLogo: boolean;
  onIncludeLogoChange: (checked: boolean) => void;
}

export function ProductCodesPanel({
  codigoProducto,
  includeLogo,
  onIncludeLogoChange,
}: ProductCodesPanelProps) {
  const [activeTab, setActiveTab] = useState<CodeTab>("qr");

  const codigo = codigoProducto?.trim() || "placeholder";

  return (
    <section className="min-w-0 rounded-lg border bg-card p-3">
      <header className="mb-3 text-center">
        <h3 className="text-xs font-semibold text-card-foreground">
          Códigos del producto
        </h3>

        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
          {codigoProducto?.trim() || "Sin código asignado"}
        </p>
      </header>

      <div className="mb-3 grid grid-cols-2 rounded-md border bg-muted/30 p-0.5">
        <Button
          type="button"
          size="sm"
          variant={activeTab === "qr" ? "default" : "ghost"}
          className="h-7 gap-1 text-[11px]"
          onClick={() => setActiveTab("qr")}
        >
          <QrCode className="h-3 w-3" />
          QR
        </Button>

        <Button
          type="button"
          size="sm"
          variant={activeTab === "barcode" ? "default" : "ghost"}
          className="h-7 gap-1 text-[11px]"
          onClick={() => setActiveTab("barcode")}
        >
          <Barcode className="h-3 w-3" />
          Barras
        </Button>
      </div>

      <div className="flex min-h-[190px] items-center justify-center rounded-md border bg-background p-2">
        {activeTab === "qr" ? (
          <GeneradorQR valor={codigo} includeLogo={includeLogo} />
        ) : (
          <GeneradorBarras valor={codigo} />
        )}
      </div>

      <div className="mt-3 flex items-center justify-center gap-2 border-t pt-3">
        <Switch
          id="logo-qr"
          checked={includeLogo}
          disabled={activeTab !== "qr"}
          onCheckedChange={onIncludeLogoChange}
        />

        <label
          htmlFor="logo-qr"
          className="cursor-pointer text-xs text-muted-foreground"
        >
          Incluir logo
        </label>
      </div>
    </section>
  );
}
