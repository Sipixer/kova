export function formatWhen(value: Date | string | number) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDay(value: Date | string | number) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}
