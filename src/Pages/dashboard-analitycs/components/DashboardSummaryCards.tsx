import type { DashboardVentasAnalyticsResponse } from "@/hooks/use-dashboard/use-dashboard";
import { AnalyticsSummaryCard } from "./AnalyticsSummaryCard";
import { capitalizeText, getShortDateLabel } from "../helpers/helpers";
import { formattMonedaGT } from "@/utils/formattMoneda";
import { dashboardColors } from "../color/colors";

type DashboardSummaryCardsProps = {
  data: DashboardVentasAnalyticsResponse;
};

function formatNumberGT(value: number) {
  return Number(value || 0).toLocaleString("es-GT");
}

export function DashboardSummaryCards({ data }: DashboardSummaryCardsProps) {
  const resumen = data.resumen;
  const comparativo = data.charts.comparativoVentasPorMes.data;

  const totalIngresos = comparativo.totalPeriodo;

  const mesesPeriodo = comparativo.data
    .map((item) => capitalizeText(item.mes))
    .join(" + ");

  const mejorMes = resumen.mejorMes.data;
  const mejorDia = resumen.mejorDia.data;
  const categoriaTop = resumen.categoriaTop.data;
  const transacciones = resumen.transaccionesMes.data;

  const mejorMesPorcentaje =
    comparativo.totalPeriodo > 0
      ? ((mejorMes.totalVentas / comparativo.totalPeriodo) * 100).toFixed(1)
      : "0.0";

  const categoriaTopPorcentaje =
    comparativo.totalPeriodo > 0
      ? ((categoriaTop.totalVentas / comparativo.totalPeriodo) * 100).toFixed(1)
      : "0.0";

  return (
    <section className={dashboardColors.summary.wrapper}>
      <div className={dashboardColors.summary.grid}>
        <AnalyticsSummaryCard
          label="Total ingresos"
          value={formattMonedaGT(totalIngresos)}
          description={
            mesesPeriodo ? `${mesesPeriodo} · limpio` : "Sin periodo disponible"
          }
          accentClassName={dashboardColors.accents.totalIngresos}
          dotClassName={dashboardColors.dots.totalIngresos}
        />

        <AnalyticsSummaryCard
          label="Mejor mes"
          value={capitalizeText(mejorMes.mes)}
          description={`${formattMonedaGT(
            mejorMes.totalVentas,
          )} · ${mejorMesPorcentaje}% del total`}
          accentClassName={dashboardColors.accents.mejorMes}
          dotClassName={dashboardColors.dots.mejorMes}
        />

        <AnalyticsSummaryCard
          label="Mejor día"
          value={getShortDateLabel(mejorDia.dia)}
          description={`${formattMonedaGT(
            mejorDia.totalVentas,
          )} en un solo día`}
          accentClassName={dashboardColors.accents.mejorDia}
          dotClassName={dashboardColors.dots.mejorDia}
        />

        <AnalyticsSummaryCard
          label="Categoría top"
          value={capitalizeText(categoriaTop.categoriaNombre)}
          description={`${formattMonedaGT(
            categoriaTop.totalVentas,
          )} · ${categoriaTopPorcentaje}% del total`}
          accentClassName={dashboardColors.accents.categoriaTop}
          dotClassName={dashboardColors.dots.categoriaTop}
        />

        <AnalyticsSummaryCard
          label="Transacciones"
          value={formatNumberGT(transacciones.transacciones)}
          description={`en ${formatNumberGT(
            transacciones.diasActivos,
          )} días activos`}
          accentClassName={dashboardColors.accents.transacciones}
          dotClassName={dashboardColors.dots.transacciones}
        />
      </div>
    </section>
  );
}
