import {
  ExistingImage,
  ProductCreateDTO,
  ProductDetailDTO,
  RolPrecio,
  UIMedia,
} from "./interfaces/DomainProdPressTypes";

/**
 * Normaliza a string decimal.
 * El backend valida si es positivo o si cumple formato decimal.
 */
export const toDecimal = (value: unknown, fallback = "0"): string => {
  if (value === null || value === undefined) return fallback;

  const clean = String(value).trim();

  return clean === "" ? fallback : clean;
};

const toNum = (value: unknown) => {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : null;
};

const sameIdSet = (a: number[], b: number[]) => {
  if (a.length !== b.length) return false;

  const setA = new Set(a);

  for (const item of b) {
    if (!setA.has(item)) return false;
  }

  return true;
};

export const isFile = (media: UIMedia): media is File => media instanceof File;

export const isExisting = (media: UIMedia): media is ExistingImage =>
  Boolean((media as ExistingImage).url) && !(media instanceof File);

/**
 * Builder de FormData para crear/editar PRODUCTO PURO.
 *
 * Ya NO envía:
 * - presentaciones
 * - deletedPresentationIds
 * - keepPresentationImageIds
 * - presentaciones[i].images
 *
 * Solo envía:
 * - datos base de producto
 * - categorías
 * - precios de producto
 * - imágenes nuevas del producto
 * - keepProductImageIds en edición si cambió el set de imágenes existentes
 */
export function buildFormData(
  form: ProductCreateDTO,
  creadoPorId: number,
  opts?: {
    isEditing?: boolean;
    original?: ProductDetailDTO;
  },
): FormData {
  const isEditing = Boolean(opts?.isEditing);
  const original = opts?.original;

  const fd = new FormData();

  // ==========================================================================
  // CAMPOS PLANOS DEL PRODUCTO
  // ==========================================================================

  fd.append("nombre", form.basicInfo.nombre?.trim() ?? "");
  fd.append("descripcion", form.description ?? "");
  fd.append("codigoProducto", form.basicInfo.codigoProducto?.trim() ?? "");
  fd.append("codigoProveedor", form.basicInfo.codigoProveedor?.trim() ?? "");
  fd.append("stockMinimo", String(form.basicInfo.stockMinimo ?? 0));

  fd.append(
    "precioCostoActual",
    toDecimal(form.basicInfo.precioCostoActual, "0"),
  );

  fd.append("creadoPorId", String(creadoPorId));

  /**
   * Esto NO es presentación del producto como entidad.
   * Es el tipo/empaque base del producto.
   * Si después también lo quitas del modelo, elimina este bloque.
   */
  if (form.basicInfo.tipoPresentacionId != null) {
    fd.append("tipoPresentacionId", String(form.basicInfo.tipoPresentacionId));
  } else {
    fd.append("tipoPresentacionId", "");
  }

  // ==========================================================================
  // CATEGORÍAS
  // ==========================================================================

  fd.append(
    "categorias",
    JSON.stringify((form.basicInfo.categorias ?? []).map((cat) => cat.id)),
  );

  // ==========================================================================
  // PRECIOS DEL PRODUCTO
  // ==========================================================================

  fd.append(
    "precioVenta",
    JSON.stringify(
      (form.prices ?? []).map((price) => ({
        rol: price.rol as RolPrecio,
        orden: Number(price.orden) || 1,
        precio: toDecimal(price.precio, "0"),
      })),
    ),
  );

  // ==========================================================================
  // IMÁGENES NUEVAS DEL PRODUCTO
  // ==========================================================================

  (form.images ?? []).filter(isFile).forEach((file) => {
    fd.append("images", file);
  });

  // ==========================================================================
  // EDICIÓN: KEEP DE IMÁGENES EXISTENTES
  // ==========================================================================

  if (isEditing && original) {
    const currentExistingImageIds = (form.images ?? [])
      .filter(isExisting)
      .map((img) => toNum(img.id))
      .filter((id): id is number => id !== null);

    const originalImageIds = (original.imagenesProducto ?? [])
      .map((img) => toNum(img.id))
      .filter((id): id is number => id !== null);

    /**
     * Como ahora las imágenes existentes se eliminan con una mutación directa:
     *
     * DELETE /products/images/:imageId
     *
     * este keepProductImageIds es solo respaldo para sincronizar en edición.
     *
     * Se envía únicamente si hubo cambio real respecto a las imágenes originales.
     */
    const imageSetChanged = !sameIdSet(
      currentExistingImageIds,
      originalImageIds,
    );

    if (imageSetChanged) {
      fd.append("keepProductImageIds", JSON.stringify(currentExistingImageIds));
    }
  }

  return fd;
}

/**
 * Utilidad para inspeccionar el FormData.
 */
export function debugFormData(fd: FormData, label = "FORMDATA") {
  const out: Record<string, any[]> = {};

  for (const [key, value] of fd.entries()) {
    if (!out[key]) out[key] = [];

    out[key].push(
      value instanceof File
        ? `(File) ${value.name} (${value.type}, ${value.size}b)`
        : value,
    );
  }

  console.log(label, out);
}
