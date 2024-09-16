import { useSession } from "next-auth/react";
import { useQuery } from "react-query";
import { allProjects } from "../utils/api";
import Link from "next/link";

export default function Index() {
  useSession({ required: true });
  const { data: projects } = useQuery("projects", allProjects);

  return (
    <main className="px-4 py-12 lg:px-8">
      <h1 className="text-gray-500 text-2xl font-semibold pb-4">Projects</h1>
      <ul role="list" className="divide-y divide-gray-100">
        {projects?.data.map((project) => (
          <li key={project.id} className="flex flex-1 gap-x-6">
            <Link
              href={`/projects/${project.id}`}
              className="flex-1 text-sm font-semibold leading-6 text-gray-900 py-5"
            >
              {project.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

Index.auth = true;
