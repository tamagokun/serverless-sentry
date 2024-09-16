import { format } from "date-fns";

export function displayTimestamp(timestamp: number) {
  return format(new Date(timestamp * 1000), "PPpp");
}
