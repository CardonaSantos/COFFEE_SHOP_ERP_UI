export type StockToEditResponse = {
  kind: string; // indica de qué tabla viene el lote
  id: number;
  productoId: number;
  productoNombre: string;
  sucursalId: number;
  sucursalNombre: string;
  cantidad: number; // solo lectura
  fechaIngreso: string; // ISO
  fechaVencimiento?: string | null; // ISO | null
  precioCosto?: number; // solo lectura
  // Campos solo si kind === "PRESENTACION"
  presentacionId?: number;
  presentacionNombre?: string;
  // Extras útiles en UI
  codigoProducto?: string;
};
