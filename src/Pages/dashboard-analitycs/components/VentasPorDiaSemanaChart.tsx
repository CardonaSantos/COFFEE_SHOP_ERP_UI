import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { VentasDiaSemanaChartItem } from "@/hooks/use-dashboard/use-dashboard";
import { dashboardColors } from "../color/colors";
import { formattMonedaGT } from "@/utils/formattMoneda";
import { useIsDarkMode } from "../helpers/use-dark";

type VentasPorDiaSemanaChartProps = {
  data: VentasDiaSemanaChartItem[];
  isError?: boolean;
  errorMessage?: string | null;
};

export function VentasPorDiaSemanaChart({
  data,
  isError,
  errorMessage,
}: VentasPorDiaSemanaChartProps) {
  const isDark = useIsDarkMode();

  const hasData = data.some((item) => item.totalVentas > 0);

  const chartTextColor = isDark
    ? dashboardColors.chart.textDark
    : dashboardColors.chart.text;

  const chartGridColor = isDark
    ? dashboardColors.chart.gridDark
    : dashboardColors.chart.grid;

  const chartBarColor = isDark
    ? dashboardColors.chart.barDark
    : dashboardColors.chart.bar;

  return (
    <section className={dashboardColors.shell.section}>
      <div className={dashboardColors.shell.sectionHeader}>
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${dashboardColors.dots.ventasDiaSemana}`}
          />

          <h2 className={dashboardColors.text.label}>
            Ventas por día de la semana
          </h2>
        </div>
      </div>

      <div className={dashboardColors.shell.sectionBody}>
        {isError ? (
          <div className={dashboardColors.shell.emptyBox}>
            <p className={dashboardColors.text.error}>
              {errorMessage ?? "No se pudo cargar ventas por día de la semana"}
            </p>
          </div>
        ) : !hasData ? (
          <div className={dashboardColors.shell.emptyBox}>
            <p className={dashboardColors.text.empty}>
              No hay ventas por día de la semana para mostrar.
            </p>
          </div>
        ) : (
          <div className={dashboardColors.shell.chartBox}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{
                  top: 8,
                  right: 16,
                  left: 12,
                  bottom: 8,
                }}
              >
                <CartesianGrid
                  horizontal={false}
                  stroke={chartGridColor}
                  strokeOpacity={1}
                />

                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: chartTextColor,
                    fontSize: 12,
                  }}
                  tickFormatter={(value) =>
                    Number(value) >= 1000
                      ? `Q${Number(value) / 1000}k`
                      : `Q${Number(value)}`
                  }
                />

                <YAxis
                  type="category"
                  dataKey="dia"
                  tickLine={false}
                  axisLine={false}
                  width={90}
                  tick={{
                    fill: chartTextColor,
                    fontSize: 12,
                  }}
                />

                <Tooltip
                  cursor={{ fill: dashboardColors.chart.cursor }}
                  contentStyle={{
                    background: dashboardColors.chart.tooltipBg,
                    border: `1px solid ${dashboardColors.chart.tooltipBorder}`,
                    borderRadius: 6,
                    color: dashboardColors.chart.tooltipText,
                  }}
                  labelStyle={{
                    color: dashboardColors.chart.tooltipText,
                    fontWeight: 600,
                  }}
                  formatter={(value) => [
                    formattMonedaGT(Number(value)),
                    "Ventas",
                  ]}
                  labelFormatter={(label) => String(label)}
                />

                <Bar
                  dataKey="totalVentas"
                  fill={chartBarColor}
                  radius={[0, 4, 4, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  );
}
