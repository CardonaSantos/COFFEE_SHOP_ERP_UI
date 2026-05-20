// // types/cierres.types.ts

// export type ModoCierre =
//   | "SIN_DEPOSITO"
//   | "DEPOSITO_AUTO"
//   | "DEPOSITO_PARCIAL"
//   | "DEPOSITO_TODO"
//   | "CAMBIO_TURNO";

// export interface PreviaCierreResponse {
//   registroCajaId: number;
//   sucursalId: number;
//   saldoInicial: number;
//   enCaja: number;
//   enCajaOperable: number;
//   fondoFijoActual: number;
//   sugeridoDepositarAuto: number;
//   puedeDepositarHasta: number;
//   desglose?: {
//     ingresosEfectivo: number;
//     egresosEfectivo: number;
//     depositosCierre: number;
//   };
//   warnings?: string[];
//   timestamp?: string;
// }

// export interface CerrarCajaV3Dto {
//   registroCajaId: number;
//   usuarioCierreId: number;
//   comentarioFinal?: string;

//   modo: ModoCierre;

//   efectivoContado?: number;

//   cuentaBancariaId?: number;
//   montoParcial?: number;
//   objetivoFondo?: number;

//   abrirSiguiente?: boolean;
//   usuarioInicioSiguienteId?: number;
//   fondoFijoSiguiente?: number;
//   comentarioAperturaSiguiente?: string;
// }

// export interface CerrarCajaV3Response {
//   turnoCerrado: {
//     id: number;
//     saldoFinal: number;
//     depositoRealizado: number;
//     efectivoContado: number | null;
//     diferenciaCaja: number | null;
//     estadoCuadre: "CUADRA" | "SOBRANTE" | "FALTANTE" | null;
//   };
//   movimientos?: {
//     deposito?: { id: number } | null;
//   };
//   cajas?: {
//     enCajaAntes: number;
//     baseDejada: number;
//     disponibleParaDepositar: number;
//   };
//   ventas?: {
//     efectivoTurno: number;
//   };
//   nuevoTurno?: {
//     id: number;
//     saldoInicial: number;
//   } | null;
//   warnings: string[];
// }
