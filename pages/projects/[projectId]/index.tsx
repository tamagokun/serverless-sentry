import { useQuery } from "react-query";
import { eventsForProject } from "../../../utils/api";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Project() {
  const router = useRouter();
  const { projectId } = router.query;
  // display all events for a project
  const { data: events } = useQuery(
    ["events", projectId],
    eventsForProject(projectId)
  );

  return (
    <main className="px-4 py-12 lg:px-8">
      <ul role="list" className="divide-y divide-gray-200">
        {events?.data.map((event) => (
          <li key={event.id}>
            <Link
              href={`/projects/${projectId}/${event.id}`}
              className="flex items-center justify-between gap-x-6 py-5"
            >
              <div className="flex-1">
                <p className="text-sm font-semibold leading-6 text-gray-900">
                  {event.message || event.type}
                </p>
              </div>
              <div>{event.count}</div>
              <div>
                <p className="text-xs leading-5 text-gray-500">
                  Last seen <time>{event.lastEventAt}</time>
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

Project.auth = true;
