export interface ClientSelect {
  id: number;
  nombre: string;
  apellidos: string;
  telefono: string;
  dpi: string;
  nit: string;
  iPInternet: string;
  direccion: string;
  actualizadoEn: Date;
  _count: {
    compras: number;
  };
}
