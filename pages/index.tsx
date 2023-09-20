import { useSession } from "next-auth/react";
import { useQuery } from "react-query";
import { allProjects } from "../api";
import Link from "next/link";

export default function Index() {
  const { data: session, status } = useSession();
  const { data: projects } = useQuery("projects", allProjects);

  return (
    <main className="px-4 py-12 lg:px-8">
      <ul role="list" className="divide-y dividr-gray-100">
        {projects?.data.map((project) => (
          <li key={project.id} className="flex gap-x-6 py-5">
            <Link
              href={`/projects/${project.id}`}
              className="text-sm font-semibold leading-6 text-gray-900"
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
