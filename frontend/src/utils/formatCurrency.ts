export function formatCurrency(
  value: number | string | undefined | null,
  locale: string = "es-CL",
  currency: string = "CLP"
): string {
  const numberValue = Number(value);
  if (isNaN(numberValue)) {
    return "$0";
  }
  return numberValue.toLocaleString(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  });
}
