export async function allProjects() {
  return fetch("/api/list").then((res) => res.json());
}

export function eventsForProject(projectId: string | string[] | number) {
  return async () =>
    fetch(`/api/${projectId}/events`).then((res) => res.json());
}
