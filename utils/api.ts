export async function allProjects() {
  return fetch("/api/list").then((res) => res.json());
}

export function eventsForProject(projectId: string | string[] | number) {
  return async () =>
    fetch(`/api/${projectId}/events`).then((res) => res.json());
}

export function singleEvent(
  eventId: string | string[],
  projectId: string | string[]
) {
  return async () =>
    fetch(`/api/${projectId}/events/${eventId}`).then((res) => res.json());
}
