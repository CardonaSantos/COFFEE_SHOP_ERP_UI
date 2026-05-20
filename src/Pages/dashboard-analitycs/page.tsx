import {
  initialDashboardVentasAnalytics,
  useGetDashboardData,
} from "@/hooks/use-dashboard/use-dashboard";
import { DashboardSummaryCards } from "./components/DashboardSummaryCards";
import { ComparativoVentasMesChart } from "./components/ComparativoVentasMesChart";
import { VentasPorDiaSemanaChart } from "./components/VentasPorDiaSemanaChart";
import { TendenciaVentasDiariasChart } from "./components/TendenciaVentasDiariasChart";
import { TopProductosPorIngresoChart } from "./components/TopProductosPorIngresoChart";
import { TopCategoriasPorIngresoChart } from "./components/TopCategoriasPorIngresoChart";
import { TopFechasPorIngresoChart } from "./components/TopFechasPorIngresoChart";

function DashboardAnalitycs() {
  const { data: dashboardData } = useGetDashboardData();

  const data = dashboardData ? dashboardData : initialDashboardVentasAnalytics;
  console.log("La data es: ", dashboardData);
  const comparativoMeses = data.charts.comparativoVentasPorMes;
  const ventasPorDiaSemana = data.charts.ventasPorDiaSemana;
  const tendenciaDiaria = data.charts.tendenciaVentasDiarias;
  const topProductos = data.charts.topProductosPorIngreso;
  const topCategorias = data.charts.topCategoriasPorIngreso;
  const topFechas = data.charts.topFechasPorIngreso;

  return (
    <main className="w-full text-slate-100">
      <DashboardSummaryCards data={data} />

      <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2">
        <ComparativoVentasMesChart
          data={comparativoMeses.data.data}
          totalPeriodo={comparativoMeses.data.totalPeriodo}
          isError={!comparativoMeses.ok}
          errorMessage={comparativoMeses.error}
        />

        <VentasPorDiaSemanaChart
          data={ventasPorDiaSemana.data.data}
          isError={!ventasPorDiaSemana.ok}
          errorMessage={ventasPorDiaSemana.error}
        />
      </div>

      <div className="px-4 pb-4">
        <TendenciaVentasDiariasChart
          data={tendenciaDiaria.data.data}
          totalPeriodo={tendenciaDiaria.data.totalPeriodo}
          cantidadVentasPeriodo={tendenciaDiaria.data.cantidadVentasPeriodo}
          fechaInicio={tendenciaDiaria.data.fechaInicio}
          fechaFin={tendenciaDiaria.data.fechaFin}
          isError={!tendenciaDiaria.ok}
          errorMessage={tendenciaDiaria.error}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 px-4 pb-4 lg:grid-cols-2">
        <TopProductosPorIngresoChart
          data={topProductos.data.data}
          fechaInicio={topProductos.data.fechaInicio}
          fechaFin={topProductos.data.fechaFin}
          isError={!topProductos.ok}
          errorMessage={topProductos.error}
        />

        <TopCategoriasPorIngresoChart
          data={topCategorias.data.data}
          fechaInicio={topCategorias.data.fechaInicio}
          fechaFin={topCategorias.data.fechaFin}
          isError={!topCategorias.ok}
          errorMessage={topCategorias.error}
        />
      </div>
      <div className="px-4 pb-4">
        <TopFechasPorIngresoChart
          data={topFechas.data.data}
          fechaInicio={topFechas.data.fechaInicio}
          fechaFin={topFechas.data.fechaFin}
          isError={!topFechas.ok}
          errorMessage={topFechas.error}
        />
      </div>
    </main>
  );
}

export default DashboardAnalitycs;
