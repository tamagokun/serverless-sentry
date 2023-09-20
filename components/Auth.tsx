import { useSession } from "next-auth/react";

type Props = {
  children: React.ReactNode;
};

export function Auth({ children }: Props) {
  const { status } = useSession({
    required: true,
  });

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
