import { useQuery } from "react-query";
import { eventsForProject } from "../../../api";
import { useRouter } from "next/router";

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
      <ul role="list" className="divide-y dividr-gray-100">
        {events?.data.map((event) => (
          <li
            key={event.id}
            className="flex items-center justify-between gap-x-6 py-5"
          >
            <div className="flex">
              <p className="text-sm font-semibold leading-6 text-gray-900">
                {event.message}
              </p>
            </div>
            <div className="flex">
              <p className="text-xs leading-5 text-gray-500">
                Last seen on: <time>{event.lastEventAt}</time>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
