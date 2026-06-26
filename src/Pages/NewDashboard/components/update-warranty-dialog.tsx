"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReplaceUnderlines } from "@/utils/UtilsII";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EstadoGarantia, GarantiaType } from "../types/newGarantyTypes";

interface UpdateWarrantyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectWarrantyUpdate: GarantiaType | null;
  comentario: string;
  setComentario: (value: string) => void;
  descripcionProblema: string;
  setDescripcionProblema: (value: string) => void;
  estado: EstadoGarantia | null;
  setEstado: (value: EstadoGarantia) => void;
  handleUpdateRegistW: () => Promise<void>;
  setOpenFinishWarranty: (open: boolean) => void;
}

const EstadoGarantiaConstants = {
  RECIBIDO: "RECIBIDO",
  DIAGNOSTICO: "DIAGNOSTICO",
  ENVIADO_PROVEEDOR: "ENVIADO_PROVEEDOR",
  EN_REPARACION: "EN_REPARACION",
  REPARADO: "REPARADO",
  REEMPLAZADO: "REEMPLAZADO",
  CERRADO: "CERRADO",
} as const;

export function UpdateWarrantyDialog({
  open,
  onOpenChange,
  comentario,
  setComentario,
  descripcionProblema,
  setDescripcionProblema,
  estado,
  setEstado,
  handleUpdateRegistW,
}: UpdateWarrantyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">
            Editar seguimiento de garantía
          </DialogTitle>
          <DialogDescription className="text-center">
            Cada vez que actualices, se añadirá un nuevo registro al historial
            de esta garantía.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="block">
            <Label htmlFor="comentario">Comentario</Label>
            <Textarea
              id="comentario"
              className="mt-1 w-full"
              placeholder="Agrega un comentario breve..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
          </div>

          <div className="block">
            <Label htmlFor="descripcion">Descripción del problema</Label>
            <Textarea
              id="descripcion"
              className="mt-1 w-full"
              placeholder="Describe los detalles detectados..."
              value={descripcionProblema}
              onChange={(e) => setDescripcionProblema(e.target.value)}
            />
          </div>

          <div className="block">
            <Label htmlFor="estado">Estado de la garantía</Label>
            <Select
              value={estado || ""}
              onValueChange={(v) => setEstado(v as EstadoGarantia)}
            >
              <SelectTrigger id="estado" className="mt-1 w-full">
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Opciones de estado</SelectLabel>
                  {Object.values(EstadoGarantiaConstants).map((estadoValue) => (
                    <SelectItem key={estadoValue} value={estadoValue}>
                      {ReplaceUnderlines(estadoValue)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <Button onClick={handleUpdateRegistW} className="w-full">
            Guardar cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
