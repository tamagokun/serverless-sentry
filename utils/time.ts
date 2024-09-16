import { format } from "date-fns";

export function displayTimestamp(timestamp: number) {
  if (!timestamp) {
    return "";
  }

  return format(new Date(timestamp * 1000), "PPpp");
}
