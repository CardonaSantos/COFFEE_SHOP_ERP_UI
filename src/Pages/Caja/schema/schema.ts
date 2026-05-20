import z from "zod";

export const ComprobanteTipoZ = z.enum([
  "DEPOSITO_BOLETA",
  "TRANSFERENCIA",
  "CHEQUE",
  "TARJETA_VOUCHER",
  "OTRO",
]);

export const schemaBase = z

  .object({
    modo: z.enum([
      "SIN_DEPOSITO",
      "DEPOSITO_PARCIAL",
      "DEPOSITO_TODO",
      "CAMBIO_TURNO",
    ] as const),
    comentarioFinal: z.string().optional(),
    efectivoContado: z.number().min(0, "Ingrese un efectivo contado válido"),
    cuentaBancariaId: z.number().optional(),
    montoParcial: z.number().optional(),

    comprobanteTipo: ComprobanteTipoZ.optional(),
    comprobanteNumero: z.string().trim().optional(),
    comprobanteFecha: z.string().trim().optional(), // "YYYY-MM-DD" del <input type="date">

    dejarEnCaja: z.number().min(0, "No puede ser negativo"),
    asentarVentas: z.boolean(),

    abrirSiguiente: z.boolean().optional(),
    usuarioInicioSiguienteId: z.number().optional(),
    fondoFijoSiguiente: z.number().optional(),
    comentarioAperturaSiguiente: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const requiereDeposito =
      data.modo === "DEPOSITO_PARCIAL" || data.modo === "DEPOSITO_TODO";

    if (requiereDeposito) {
      if (!data.cuentaBancariaId) {
        ctx.addIssue({
          path: ["cuentaBancariaId"],
          code: z.ZodIssueCode.custom,
          message: "Cuenta bancaria requerida",
        });
      }
      if (!data.comprobanteTipo) {
        ctx.addIssue({
          path: ["comprobanteTipo"],
          code: z.ZodIssueCode.custom,
          message: "Tipo de comprobante requerido",
        });
      }
      if (!data.comprobanteNumero || data.comprobanteNumero.trim().length < 3) {
        ctx.addIssue({
          path: ["comprobanteNumero"],
          code: z.ZodIssueCode.custom,
          message: "Número de comprobante requerido (mín. 3 caract.)",
        });
      }
    }

    if (data.modo === "DEPOSITO_PARCIAL") {
      if (!data.montoParcial || data.montoParcial <= 0) {
        ctx.addIssue({
          path: ["montoParcial"],
          code: z.ZodIssueCode.custom,
          message: "Monto debe ser > 0",
        });
      }
    }
  });
