import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { singleEvent } from "../../../../utils/api";
import Breadcrumbs from "../../../../components/Breadcrumbs";
import StackTrace from "../../../../components/StackTrace";

export default function Event() {
  const router = useRouter();
  const { projectId, eventId } = router.query;

  const { data: event } = useQuery(
    ["event", projectId, eventId],
    singleEvent(eventId, projectId)
  );

  console.log(event);

  return (
    <main className="flex flex-col flex-1 gap-4 px-4 py-12 lg:px-8">
      <div className="border-b border-gray-300 pb-4">
        <h1 className="font-semibold text-lg leading-6 text-gray-900">
          {event?.message}
        </h1>
      </div>
      {!!event?.stack && (
        <div>
          <h2 className="font-semibold leading-6 text-gray-900 py-2">Stack</h2>
          <StackTrace stack={event.stack.frames ?? []} />
        </div>
      )}
      {!!event?.meta?.breadcrumbs && (
        <div>
          <h2 className="font-semibold leading-6 text-gray-900 py-2">
            Breadcrumbs
          </h2>
          <Breadcrumbs breadcrumbs={event.meta.breadcrumbs} />
        </div>
      )}
    </main>
  );
}

Event.auth = true;
