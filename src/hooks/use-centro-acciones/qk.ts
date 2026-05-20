export type DashboardAuthorizationFilters = {
  estado?: string;
  page?: number;
  limit?: number;
};

export const DASHBOARD_AUTH_FILTERS: DashboardAuthorizationFilters = {
  estado: "PENDIENTE",
  page: 1,
  limit: 20,
};

export const dashboardQkeys = {
  all: ["dashboard-operations"] as const,

  selects: () => [...dashboardQkeys.all, "selects"] as const,

  proveedores: () => [...dashboardQkeys.selects(), "proveedores"] as const,

  cuentasBancarias: () =>
    [...dashboardQkeys.selects(), "cuentas-bancarias"] as const,

  cajasDisponibles: (sucursalId: number) =>
    [...dashboardQkeys.selects(), "cajas-disponibles", sucursalId] as const,

  creditAuthorizations: {
    root: () => [...dashboardQkeys.all, "credit-authorizations"] as const,

    list: (filters: DashboardAuthorizationFilters) =>
      [
        ...dashboardQkeys.creditAuthorizations.root(),
        {
          estado: filters.estado ?? "",
          page: Number(filters.page) || 1,
          limit: Number(filters.limit) || 20,
        },
      ] as const,
  },

  creditRecords: {
    root: () => [...dashboardQkeys.all, "credit-records"] as const,

    simple: () =>
      [...dashboardQkeys.creditRecords.root(), "simple-dashboard"] as const,
  },

  priceRequests: {
    root: () => [...dashboardQkeys.all, "price-requests"] as const,

    list: (sucursalId: number) =>
      [...dashboardQkeys.priceRequests.root(), sucursalId] as const,
  },

  transferRequests: {
    root: () => [...dashboardQkeys.all, "transfer-requests"] as const,

    list: (sucursalId: number) =>
      [...dashboardQkeys.transferRequests.root(), sucursalId] as const,
  },

  warranties: {
    root: () => [...dashboardQkeys.all, "warranties"] as const,

    list: () => [...dashboardQkeys.warranties.root(), "list"] as const,
  },

  repairs: {
    root: () => [...dashboardQkeys.all, "repairs"] as const,

    opened: () => [...dashboardQkeys.repairs.root(), "opened"] as const,
  },
};
