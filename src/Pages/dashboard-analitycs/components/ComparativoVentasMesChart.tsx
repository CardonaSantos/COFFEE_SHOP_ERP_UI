import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ComparativoMesChartItem } from "@/hooks/use-dashboard/use-dashboard";
import { dashboardColors } from "../color/colors";
import { formattMonedaGT } from "@/utils/formattMoneda";

type ComparativoVentasMesChartProps = {
  data: ComparativoMesChartItem[];
  totalPeriodo: number;
  isError?: boolean;
  errorMessage?: string | null;
};

function useIsDarkMode() {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const root = document.documentElement;

    const update = () => {
      setIsDark(root.classList.contains("dark"));
    };

    update();

    const observer = new MutationObserver(update);

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
}

export function ComparativoVentasMesChart({
  data,
  totalPeriodo,
  isError,
  errorMessage,
}: ComparativoVentasMesChartProps) {
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

  const chartBarMutedColor = isDark
    ? dashboardColors.chart.barMutedDark
    : dashboardColors.chart.barMuted;

  return (
    <section className={dashboardColors.shell.section}>
      <div className={dashboardColors.shell.sectionHeader}>
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${dashboardColors.dots.comparativoMes}`}
          />

          <h2 className={dashboardColors.text.label}>Comparativo por mes</h2>
        </div>
      </div>

      <div className={dashboardColors.shell.sectionBody}>
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.map((item) => (
            <div
              key={`${item.anio}-${item.mesNumero}`}
              className={dashboardColors.card.soft}
            >
              <p
                className={`mb-2 text-center ${dashboardColors.text.miniLabel}`}
              >
                {item.label}
              </p>

              <p className={dashboardColors.text.chartValue}>
                {formattMonedaGT(item.totalVentas)}
              </p>

              <p
                className={`mt-2 text-center ${dashboardColors.text.description}`}
              >
                {item.porcentaje}% del periodo
              </p>
            </div>
          ))}
        </div>

        {isError ? (
          <div className="flex h-[280px] items-center justify-center border border-border">
            <p className={dashboardColors.text.error}>
              {errorMessage ?? "No se pudo cargar el comparativo por mes"}
            </p>
          </div>
        ) : !hasData ? (
          <div className="flex h-[280px] items-center justify-center border border-border">
            <p className={dashboardColors.text.empty}>
              No hay ventas para mostrar en este periodo.
            </p>
          </div>
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 8,
                  right: 8,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke={chartGridColor}
                  strokeOpacity={1}
                />

                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
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
                />

                <Bar
                  dataKey="totalVentas"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={90}
                >
                  {data.map((item) => (
                    <Cell
                      key={`${item.anio}-${item.mesNumero}`}
                      fill={
                        item.esMesActual ? chartBarMutedColor : chartBarColor
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="mt-3 border-t border-border pt-3">
          <p className={dashboardColors.text.description}>
            Total del periodo:{" "}
            <span className="font-medium text-foreground">
              {formattMonedaGT(totalPeriodo)}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
