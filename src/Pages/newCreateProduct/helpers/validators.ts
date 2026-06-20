import { ProductCreateDTO } from "../interfaces/DomainProdPressTypes";

type ValidationResult = { ok: true } | { ok: false; errors: string[] };

const gt0 = (n: unknown) => {
  const v = Number(n);
  return Number.isFinite(v) && v > 0;
};

const gte0 = (n: unknown) => {
  const v = Number(n);
  return Number.isFinite(v) && v >= 0;
};

const hasPrices = (
  arr?: { precio: unknown; rol?: unknown; orden?: unknown }[],
) =>
  Array.isArray(arr) &&
  arr.length > 0 &&
  arr.every(
    (p) =>
      gte0(p.precio) &&
      String(p.rol ?? "").trim() !== "" &&
      Number.isFinite(Number(p.orden ?? 0)),
  );

const uniqueRolOrden = (arr: { rol: string; orden: number }[]) => {
  const seen = new Set<string>();

  for (const p of arr) {
    const key = `${p.rol}|${p.orden}`;

    if (seen.has(key)) return false;

    seen.add(key);
  }

  return true;
};

/**
 * Validator actual para PRODUCTO PURO.
 *
 * El segundo parámetro se deja opcional para no romper llamadas viejas:
 * validateBeforeSubmit(formState, "product")
 *
 * Pero ya no se usa.
 */
export function validateBeforeSubmit(
  form: ProductCreateDTO,
  _legacyMode?: unknown,
): ValidationResult {
  const errors: string[] = [];

  const nombre = form.basicInfo?.nombre?.trim();
  const codigoProducto = form.basicInfo?.codigoProducto?.trim();

  if (!nombre) {
    errors.push("El nombre es obligatorio.");
  }

  if (!codigoProducto) {
    errors.push("El código de producto es obligatorio.");
  }

  if (
    form.basicInfo?.stockMinimo != null &&
    Number(form.basicInfo.stockMinimo) < 0
  ) {
    errors.push("El stock mínimo no puede ser negativo.");
  }

  if (!gt0(form.basicInfo?.precioCostoActual)) {
    errors.push("El precio costo actual debe ser mayor a 0.");
  }

  if (!Array.isArray(form.basicInfo?.categorias)) {
    errors.push("Las categorías no tienen un formato válido.");
  }

  if (!hasPrices(form.prices)) {
    errors.push("Debes definir al menos un precio válido para el producto.");
  }

  if (
    form.prices?.length &&
    !uniqueRolOrden(
      form.prices.map((p) => ({
        rol: String(p.rol),
        orden: Number(p.orden ?? 0),
      })),
    )
  ) {
    errors.push(
      "Precios de producto: no puede repetirse la combinación (rol, orden).",
    );
  }

  return errors.length ? { ok: false, errors } : { ok: true };
}
