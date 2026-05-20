import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TopProductoIngresoItem } from "@/hooks/use-dashboard/use-dashboard";
import { dashboardColors } from "../color/colors";
import { formattMonedaGT } from "@/utils/formattMoneda";
import { useIsDarkMode } from "../helpers/use-dark";

type TopProductosPorIngresoChartProps = {
  data: TopProductoIngresoItem[];
  fechaInicio: string;
  fechaFin: string;
  isError?: boolean;
  errorMessage?: string | null;
};

function truncateLabel(value: string, maxLength = 24) {
  if (!value) return "Sin nombre";
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

export function TopProductosPorIngresoChart({
  data,
  fechaInicio,
  fechaFin,
  isError,
  errorMessage,
}: TopProductosPorIngresoChartProps) {
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
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${dashboardColors.dots.topProductos}`}
            />

            <h2 className={dashboardColors.text.label}>
              Top productos por ingreso
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
              {errorMessage ?? "No se pudo cargar el top de productos"}
            </p>
          </div>
        ) : !hasData ? (
          <div className={dashboardColors.shell.emptyBox}>
            <p className={dashboardColors.text.empty}>
              No hay productos vendidos para mostrar.
            </p>
          </div>
        ) : (
          <div className={dashboardColors.shell.chartBoxLarge}>
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
                  dataKey="productoNombre"
                  tickLine={false}
                  axisLine={false}
                  width={140}
                  tick={{
                    fill: chartTextColor,
                    fontSize: 12,
                  }}
                  tickFormatter={(value) => truncateLabel(String(value))}
                />

                <Tooltip
                  cursor={{
                    fill: isDark
                      ? dashboardColors.chart.cursorDark
                      : dashboardColors.chart.cursor,
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
                      | TopProductoIngresoItem
                      | undefined;

                    if (!item) return "";

                    return `#${item.ranking} ${item.productoNombre} · ${item.cantidadVendida} vendidos`;
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
            Productos mostrados:{" "}
            <span className={dashboardColors.text.descriptionStrong}>
              {data.length.toLocaleString("es-GT")}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
