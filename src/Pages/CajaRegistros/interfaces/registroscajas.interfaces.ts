export interface UsuarioCaja {
  id: number;
  nombre: string;
  correo: string;
  rol?: string; // En usuarioInicio/usuarioCierre no siempre viene
}

export interface ProveedorCaja {
  id: number;
  nombre: string;
}

export interface MovimientoCaja {
  id: number;
  creadoEn: string;
  actualizadoEn: string;
  banco: string | null;
  categoria: string | null;
  descripcion: string | null;
  fecha: string;
  monto: number;
  numeroBoleta: string | null;
  referencia: string | null;
  tipo: string;
  usadoParaCierre: boolean | null;
  proveedor: ProveedorCaja | null;
  usuario: UsuarioCaja | null;
  clasificacion?: string; // ClasificacionAdmin
  motivo?: string; // MotivoMovimiento
  metodoPago?: string | null;

  deltaCaja?: number; // signo real
  deltaBanco?: number;

  esDepositoCierre?: boolean;
  esDepositoProveedor?: boolean;

  gastoOperativoTipo?: string | null;
  costoVentaTipo?: string | null;
  afectaInventario?: boolean;

  cuentaBancaria?: {
    id: number;
    banco: string | null;
    alias: string | null;
    numeroMasked: string | null;
  } | null;
}

export interface ImagenProducto {
  id: number; // en tu mapeo usas el índice del array como id
  public_id: string;
  url: string;
}

export interface ProductoBasico {
  id: number;
  nombre: string;
  descripcion: string | null;
  codigoProducto: string | null;
  imagenesProducto: ImagenProducto[];
}

export interface VentaProductoLinea {
  id: number; // id del registro pivot venta-producto
  cantidad: number;
  precioVenta: number;
  estado: string | null; // por si manejas estados de la línea
  producto: ProductoBasico;
}

export interface VentaCaja {
  id: number;
  totalVenta: number;
  tipoComprobante: string | null; // 'RECIBO' | 'FACTURA' | null
  metodoPago: string | null; // 'CONTADO' | 'CREDITO' | null
  fechaVenta: string;
  referenciaPago: string; // puede venir 'N/A'
  cliente: { id: number; nombre: string } | "CF";
  productos: VentaProductoLinea[]; // <-- agregado
}
export interface SucursalCaja {
  id: number;
  nombre: string;
}

export enum EstadoCuadreCaja {
  CUADRA = "CUADRA",
  SOBRANTE = "SOBRANTE",
  FALTANTE = "FALTANTE",
}

export interface RegistroCajaResponse {
  id: number;
  creadoEn: string;
  actualizadoEn: string;
  comentarioInicial: string | null;
  comentarioFinal: string | null;
  depositado: boolean;
  estado: string;

  estadoCuadre: EstadoCuadreCaja;

  efectivoContado: number;
  diferenciaCaja: number; // string
  comentarioCuadre: string; // string

  fechaApertura: string;
  fechaCierre: string;
  movimientoCaja: any | null; // si en el futuro quieres tiparlo, aquí
  saldoInicial: number;
  saldoFinal: number;
  ventasLenght: number;
  movimientosLenght: number;
  usuarioInicio: UsuarioCaja | null;
  usuarioCierre: UsuarioCaja | null;
  sucursal: SucursalCaja;
  movimientosCaja: MovimientoCaja[];
  ventas: VentaCaja[];
}

export interface PaginatedRegistrosCajaResponse {
  total: number;
  page: number;
  limit: number;
  pages: number;
  items: RegistroCajaResponse[]; // <- este es el tipo que consume la tabla
}

//PARA LENGTH DE REGISTROS
export interface lenghtData {
  cajasLength: number;
  movimientosLength: number;
}
