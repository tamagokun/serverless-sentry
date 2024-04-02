import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { singleEvent } from "../../../../utils/api";

export default function Event() {
  const router = useRouter();
  const { projectId, eventId } = router.query;

  const { data: event } = useQuery(
    ["event", projectId, eventId],
    singleEvent(eventId, projectId)
  );

  console.log(event);

  return (
    <main className="px-4 py-12 lg:px-8">
      <h1>{event?.message}</h1>
    </main>
  );
}

Event.auth = true;
