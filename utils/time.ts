import { format } from "date-fns";

export function displayTimestamp(timestamp: number | string) {
  if (!timestamp) {
    return "";
  }

  return format(
    new Date(typeof timestamp === "number" ? timestamp * 1000 : timestamp),
    "PPpp"
  );
}
