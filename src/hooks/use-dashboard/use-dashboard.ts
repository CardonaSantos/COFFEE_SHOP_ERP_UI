import { erp } from "@/API/erpApi";
import { dashboardAnalitycsQkeys } from "./qk";
import { erpEndpoints } from "@/API/routes/endpoints";

export type ComparativoMesChartItem = {
  mesNumero: number;
  anio: number;
  mes: string;
  label: string;
  totalVentas: number;
  porcentaje: number;
  esMesActual: boolean;
};

export type VentasDiaSemanaChartItem = {
  diaNumero: number;
  dia: string;
  totalVentas: number;
  cantidadVentas: number;
  porcentaje: number;
};

export type TendenciaVentasDiariasItem = {
  fecha: string;
  label: string;
  dia: string;
  mes: string;
  anio: number;
  totalVentas: number;
  cantidadVentas: number;
};

export type TendenciaVentasDiariasResponse = {
  rangoMeses: number;
  fechaInicio: string;
  fechaFin: string;
  totalPeriodo: number;
  cantidadVentasPeriodo: number;
  data: TendenciaVentasDiariasItem[];
};

export type AnalyticsBlock<T> = {
  ok: boolean;
  data: T;
  error: string | null;
};

export type MejorMesAnalytics = {
  mes: string | null;
  totalVentas: number;
  cantidadVentas: number;
};

export type MejorDiaAnalytics = {
  dia: string | null;
  diaNumero: number | null;
  totalVentas: number;
  cantidadVentas: number;
};

export type CategoriaTopAnalytics = {
  categoriaId: number | null;
  categoriaNombre: string | null;
  totalVentas: number;
  cantidadVendida: number;
  productosVendidos: number;
};

export type TransaccionesMesAnalytics = {
  transacciones: number;
  diasActivos: number;
};

export type ComparativoVentasPorMesResponse = {
  totalPeriodo: number;
  data: ComparativoMesChartItem[];
};

export type VentasDiaSemanaResponse = {
  data: VentasDiaSemanaChartItem[];
};

export type TopProductoIngresoItem = {
  ranking: number;
  productoId: number | null;
  productoNombre: string;
  totalVentas: number;
  cantidadVendida: number;
  porcentajeBarra: number;
};

export type TopCategoriaIngresoItem = {
  ranking: number;
  categoriaId: number;
  categoriaNombre: string;
  totalVentas: number;
  cantidadVendida: number;
  porcentajeBarra: number;
};

export type TopProductosPorIngresoResponse = {
  rangoMeses: number;
  fechaInicio: string;
  fechaFin: string;
  data: TopProductoIngresoItem[];
};

export type TopCategoriasPorIngresoResponse = {
  rangoMeses: number;
  fechaInicio: string;
  fechaFin: string;
  data: TopCategoriaIngresoItem[];
};

export type TopFechaIngresoItem = {
  ranking: number;
  fecha: string;
  label: string;
  dia: string;
  mes: string;
  anio: number;
  totalVentas: number;
  cantidadVentas: number;
  porcentajeBarra: number;
};

export type TopFechasPorIngresoResponse = {
  rangoMeses: number;
  fechaInicio: string;
  fechaFin: string;
  data: TopFechaIngresoItem[];
};

export type DashboardVentasAnalyticsResponse = {
  meta: {
    rangoMeses: number;
    idSucursal: number | null;
    generadoEn: string;
  };

  resumen: {
    mejorMes: AnalyticsBlock<MejorMesAnalytics>;
    mejorDia: AnalyticsBlock<MejorDiaAnalytics>;
    categoriaTop: AnalyticsBlock<CategoriaTopAnalytics>;
    transaccionesMes: AnalyticsBlock<TransaccionesMesAnalytics>;
  };

  charts: {
    comparativoVentasPorMes: AnalyticsBlock<ComparativoVentasPorMesResponse>;
    ventasPorDiaSemana: AnalyticsBlock<VentasDiaSemanaResponse>;
    tendenciaVentasDiarias: AnalyticsBlock<TendenciaVentasDiariasResponse>;
    topProductosPorIngreso: AnalyticsBlock<TopProductosPorIngresoResponse>;
    topCategoriasPorIngreso: AnalyticsBlock<TopCategoriasPorIngresoResponse>;
    topFechasPorIngreso: AnalyticsBlock<TopFechasPorIngresoResponse>;
  };
};

export interface QueryDashboard {
  rangoMeses?: number;
  idSucursal?: number;
}

export const initialDashboardVentasAnalytics: DashboardVentasAnalyticsResponse =
  {
    meta: {
      rangoMeses: 2,
      idSucursal: null,
      generadoEn: "",
    },

    resumen: {
      mejorMes: {
        ok: true,
        data: {
          mes: null,
          totalVentas: 0,
          cantidadVentas: 0,
        },
        error: null,
      },

      mejorDia: {
        ok: true,
        data: {
          dia: null,
          diaNumero: null,
          totalVentas: 0,
          cantidadVentas: 0,
        },
        error: null,
      },

      categoriaTop: {
        ok: true,
        data: {
          categoriaId: null,
          categoriaNombre: null,
          totalVentas: 0,
          cantidadVendida: 0,
          productosVendidos: 0,
        },
        error: null,
      },

      transaccionesMes: {
        ok: true,
        data: {
          transacciones: 0,
          diasActivos: 0,
        },
        error: null,
      },
    },

    charts: {
      comparativoVentasPorMes: {
        ok: true,
        data: {
          totalPeriodo: 0,
          data: [],
        },
        error: null,
      },

      topFechasPorIngreso: {
        data: {
          data: [],
          fechaFin: "",
          fechaInicio: "",
          rangoMeses: 0,
        },
        error: null,
        ok: true,
      },

      ventasPorDiaSemana: {
        ok: true,
        data: {
          data: [
            {
              diaNumero: 0,
              dia: "Domingo",
              totalVentas: 0,
              cantidadVentas: 0,
              porcentaje: 0,
            },
            {
              diaNumero: 1,
              dia: "Lunes",
              totalVentas: 0,
              cantidadVentas: 0,
              porcentaje: 0,
            },
            {
              diaNumero: 2,
              dia: "Martes",
              totalVentas: 0,
              cantidadVentas: 0,
              porcentaje: 0,
            },
            {
              diaNumero: 3,
              dia: "Miércoles",
              totalVentas: 0,
              cantidadVentas: 0,
              porcentaje: 0,
            },
            {
              diaNumero: 4,
              dia: "Jueves",
              totalVentas: 0,
              cantidadVentas: 0,
              porcentaje: 0,
            },
            {
              diaNumero: 5,
              dia: "Viernes",
              totalVentas: 0,
              cantidadVentas: 0,
              porcentaje: 0,
            },
            {
              diaNumero: 6,
              dia: "Sábado",
              totalVentas: 0,
              cantidadVentas: 0,
              porcentaje: 0,
            },
          ],
        },
        error: null,
      },

      tendenciaVentasDiarias: {
        ok: true,
        data: {
          rangoMeses: 2,
          fechaInicio: "",
          fechaFin: "",
          totalPeriodo: 0,
          cantidadVentasPeriodo: 0,
          data: [],
        },
        error: null,
      },

      topProductosPorIngreso: {
        ok: true,
        data: {
          rangoMeses: 2,
          fechaInicio: "",
          fechaFin: "",
          data: [],
        },
        error: null,
      },

      topCategoriasPorIngreso: {
        ok: true,
        data: {
          rangoMeses: 2,
          fechaInicio: "",
          fechaFin: "",
          data: [],
        },
        error: null,
      },
    },
  };

export function useGetDashboardData() {
  return erp.useQueryApi<DashboardVentasAnalyticsResponse>(
    dashboardAnalitycsQkeys.all,
    erpEndpoints.dashboard_analitycs.dashboard,
  );
}
