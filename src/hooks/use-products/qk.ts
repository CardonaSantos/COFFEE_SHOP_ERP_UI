import { QueryTable } from "@/Pages/InventarioYStock/interfaces/querytable";

function normalizeArray(value?: number[]) {
  return Array.isArray(value)
    ? [...value]
        .map(Number)
        .filter(Number.isFinite)
        .sort((a, b) => a - b)
    : [];
}

export function normalizeInventaryQuery(query: QueryTable): QueryTable {
  return {
    ...query,
    sucursalId: Number(query.sucursalId) || 0,
    page: Math.max(1, Number(query.page) || 1),
    limit: Math.min(Math.max(1, Number(query.limit) || 20), 100),
    categorias: normalizeArray(query.categorias),
    tiposPresentacion: normalizeArray(query.tiposPresentacion),
    codigoProducto: query.codigoProducto ?? "",
    productoNombre: query.productoNombre ?? "",
    fechaVencimiento: query.fechaVencimiento ?? "",
    precio: query.precio ?? "",
  };
}

export const productsQkeys = {
  all: ["products"] as const,

  inventary: () => [...productsQkeys.all, "inventary"] as const,

  inventaryParams: (query: QueryTable) =>
    [...productsQkeys.inventary(), normalizeInventaryQuery(query)] as const,

  params: (query: QueryTable) =>
    [...productsQkeys.inventary(), normalizeInventaryQuery(query)] as const,
};
