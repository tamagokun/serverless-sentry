import { Breadcrumb } from "../app-types";
import { displayTimestamp } from "../utils/time";

type Props = {
  breadcrumbs: Breadcrumb[];
};

export default function Breadcrumbs({ breadcrumbs }: Props) {
  return (
    <div className="divide-y divide-gray-200">
      {breadcrumbs.map((crumb, i) => (
        <details key={i} className="p-2">
          <summary>
            <div className="flex flex-row items-start justify-between gap-4">
              <div className="text-sm text-gray-600">{crumb.category}</div>
              <div className="text-sm flex-1 text-gray-800 font-mono">
                {crumb.message}
              </div>
              <div className="text-xs text-gray-600">
                {displayTimestamp(crumb.timestamp)}
              </div>
            </div>
          </summary>
          <div>
            <pre>{JSON.stringify(crumb.data, null, "  ")}</pre>
          </div>
        </details>
      ))}
    </div>
  );
}
