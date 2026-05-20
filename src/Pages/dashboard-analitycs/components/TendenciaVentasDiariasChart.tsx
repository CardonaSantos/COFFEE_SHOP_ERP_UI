import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TendenciaVentasDiariasItem } from "@/hooks/use-dashboard/use-dashboard";
import { dashboardColors } from "../color/colors";
import { formattMonedaGT } from "@/utils/formattMoneda";
import { useIsDarkMode } from "../helpers/use-dark";

type TendenciaVentasDiariasChartProps = {
  data: TendenciaVentasDiariasItem[];
  totalPeriodo: number;
  cantidadVentasPeriodo: number;
  fechaInicio: string;
  fechaFin: string;
  isError?: boolean;
  errorMessage?: string | null;
};

export function TendenciaVentasDiariasChart({
  data,
  totalPeriodo,
  cantidadVentasPeriodo,
  fechaInicio,
  fechaFin,
  isError,
  errorMessage,
}: TendenciaVentasDiariasChartProps) {
  const isDark = useIsDarkMode();

  const hasData = data.some((item) => item.totalVentas > 0);

  const chartTextColor = isDark
    ? dashboardColors.chart.textDark
    : dashboardColors.chart.text;

  const chartGridColor = isDark
    ? dashboardColors.chart.gridDark
    : dashboardColors.chart.grid;

  const chartLineColor = isDark
    ? dashboardColors.chart.lineDark
    : dashboardColors.chart.line;

  const chartAreaColor = isDark
    ? dashboardColors.chart.areaDark
    : dashboardColors.chart.area;

  const chartDotColor = isDark
    ? dashboardColors.chart.dotDark
    : dashboardColors.chart.dot;

  return (
    <section className={dashboardColors.shell.section}>
      <div className={dashboardColors.shell.sectionHeader}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${dashboardColors.dots.tendenciaDiaria}`}
            />

            <h2 className={dashboardColors.text.label}>
              Tendencia de ventas diarias
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
              {errorMessage ?? "No se pudo cargar la tendencia diaria"}
            </p>
          </div>
        ) : !hasData ? (
          <div className={dashboardColors.shell.emptyBox}>
            <p className={dashboardColors.text.empty}>
              No hay ventas diarias para mostrar.
            </p>
          </div>
        ) : (
          <div className={dashboardColors.shell.chartBoxLarge}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{
                  top: 10,
                  right: 16,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  stroke={chartGridColor}
                  strokeOpacity={1}
                  vertical={false}
                />

                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  minTickGap={20}
                  tick={{
                    fill: chartTextColor,
                    fontSize: 12,
                  }}
                  tickMargin={10}
                />

                <YAxis
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
                  width={56}
                />

                <Tooltip
                  cursor={{ stroke: chartGridColor }}
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
                  labelFormatter={(_, payload) => {
                    const item = payload?.[0]?.payload as
                      | TendenciaVentasDiariasItem
                      | undefined;

                    if (!item) return "";

                    return `${item.dia} ${item.mes} ${item.anio}`;
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="totalVentas"
                  stroke={chartLineColor}
                  fill={chartAreaColor}
                  strokeWidth={2}
                  dot={{
                    r: 2,
                    fill: chartDotColor,
                    stroke: chartDotColor,
                  }}
                  activeDot={{
                    r: 4,
                    fill: chartDotColor,
                    stroke: chartDotColor,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="mt-3 border-t border-border pt-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className={dashboardColors.text.description}>
              Total del periodo:{" "}
              <span className="font-medium text-foreground">
                {formattMonedaGT(totalPeriodo)}
              </span>
            </p>

            <p className={dashboardColors.text.description}>
              Transacciones:{" "}
              <span className="font-medium text-foreground">
                {cantidadVentasPeriodo.toLocaleString("es-GT")}
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
