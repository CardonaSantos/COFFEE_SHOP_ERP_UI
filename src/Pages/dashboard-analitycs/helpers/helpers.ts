export function formatCurrencyGT(value: number): string {
  return `Q ${Number(value || 0).toLocaleString("es-GT", {
    maximumFractionDigits: 0,
  })}`;
}

export function formatNumberGT(value: number): string {
  return Number(value || 0).toLocaleString("es-GT", {
    maximumFractionDigits: 0,
  });
}

export function capitalizeText(value: string | null | undefined): string {
  if (!value) return "Sin datos";

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function getShortDateLabel(value: string | null | undefined): string {
  if (!value) return "Sin datos";

  const parts = value.split(" de ");

  if (parts.length !== 2) return value;

  const day = parts[0];
  const month = parts[1].slice(0, 3);

  return `${day} ${capitalizeText(month)}`;
}
