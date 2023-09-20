import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "react-query";

import { Auth } from "../components/Auth";

import "../globals.css";

const queryClient = new QueryClient();

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <Auth>
          <Component {...pageProps} />
        </Auth>
      </QueryClientProvider>
    </SessionProvider>
  );
}
