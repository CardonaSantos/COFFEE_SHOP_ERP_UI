export interface Sucursal {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  pbx: string;
  creadoEn: string; // Puedes usar 'Date' si lo parseas como fecha
  actualizadoEn: string; // Igual aquí, 'Date' si prefieres parsearlo
  tipoSucursal:
    | "TIENDA"
    | "OFICINA"
    | "ALMACEN"
    | "TALLER"
    | "CENTRO_DISTRIBUCION"; // Si hay más tipos, los puedes agregar
  estadoOperacion: boolean;
}
