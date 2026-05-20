import { dashboardColors } from "../color/colors";

type AnalyticsSummaryCardProps = {
  label: string;
  value: string;
  description?: string;
  accentClassName: string;
  dotClassName?: string;
};

export function AnalyticsSummaryCard({
  label,
  value,
  description,
  accentClassName,
  dotClassName,
}: AnalyticsSummaryCardProps) {
  return (
    <article className={dashboardColors.card.base}>
      <div className="mb-3 flex items-center gap-2">
        {dotClassName ? (
          <span className={`h-2 w-2 rounded-full ${dotClassName}`} />
        ) : null}

        <p className={dashboardColors.text.label}>{label}</p>
      </div>

      <p className={`${dashboardColors.text.value} ${accentClassName}`}>
        {value}
      </p>

      {description ? (
        <p className={dashboardColors.text.description}>{description}</p>
      ) : null}
    </article>
  );
}
