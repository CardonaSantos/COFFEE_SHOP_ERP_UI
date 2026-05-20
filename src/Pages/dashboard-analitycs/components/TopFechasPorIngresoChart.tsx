import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TopFechaIngresoItem } from "@/hooks/use-dashboard/use-dashboard";
import { dashboardColors } from "../color/colors";
import { formattMonedaGT } from "@/utils/formattMoneda";
import { useIsDarkMode } from "../helpers/use-dark";

type TopFechasPorIngresoChartProps = {
  data: TopFechaIngresoItem[];
  fechaInicio: string;
  fechaFin: string;
  isError?: boolean;
  errorMessage?: string | null;
};

export function TopFechasPorIngresoChart({
  data,
  fechaInicio,
  fechaFin,
  isError,
  errorMessage,
}: TopFechasPorIngresoChartProps) {
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

  const chartCursorColor = isDark
    ? dashboardColors.chart.cursorDark
    : dashboardColors.chart.cursor;

  return (
    <section className={dashboardColors.shell.section}>
      <div className={dashboardColors.shell.sectionHeader}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${dashboardColors.dots.topFechas}`}
            />

            <h2 className={dashboardColors.text.label}>
              Top fechas por ingreso
            </h2>
          </div>

          <p className={dashboardColors.text.description}>
            {fechaInicio && fechaFin ? `${fechaInicio} → ${fechaFin}` : ""}
          </p>
        </div>
      </div>

      <div className={dashboardColors.shell.sectionBody}>
        {isError ? (
          <div className={dashboardColors.shell.emptyBox}>
            <p className={dashboardColors.text.error}>
              {errorMessage ?? "No se pudo cargar el top de fechas"}
            </p>
          </div>
        ) : !hasData ? (
          <div className={dashboardColors.shell.emptyBox}>
            <p className={dashboardColors.text.empty}>
              No hay fechas con ventas para mostrar.
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
                  right: 20,
                  left: 24,
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
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  width={110}
                  tick={{
                    fill: chartTextColor,
                    fontSize: 12,
                  }}
                />

                <Tooltip
                  cursor={{
                    fill: chartCursorColor,
                  }}
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
                    "Ingresos",
                  ]}
                  labelFormatter={(_, payload) => {
                    const item = payload?.[0]?.payload as
                      | TopFechaIngresoItem
                      | undefined;

                    if (!item) return "";

                    return `#${item.ranking} ${item.label} · ${item.cantidadVentas} ventas`;
                  }}
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

        <div className="mt-3 border-t border-border pt-3">
          <p className={dashboardColors.text.description}>
            Fechas mostradas:{" "}
            <span className={dashboardColors.text.descriptionStrong}>
              {data.length.toLocaleString("es-GT")}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
