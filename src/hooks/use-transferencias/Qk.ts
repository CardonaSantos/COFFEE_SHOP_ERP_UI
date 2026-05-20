// transferencia/Qk.ts
export const transferenciaQkeys = {
  all: ["transferencia"] as const,

  productos: (sucursalId: number) =>
    [...transferenciaQkeys.all, "productos", sucursalId] as const,

  sucursales: () => [...transferenciaQkeys.all, "sucursales"] as const,

  lists: () => [...transferenciaQkeys.all, "list"] as const,
};
