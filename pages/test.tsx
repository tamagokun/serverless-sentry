import Head from "next/head";

export default function Test() {
  return (
    <main>
      <Head>
        <script
          src="https://cdn.ravenjs.com/3.26.4/raven.min.js"
          crossOrigin="anonymous"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `Raven.config("https://examplePublicKey@errors.ripeworks.com/5").install();`,
          }}
        />
      </Head>
      <button
        onClick={() => {
          throw new Error("Boom!");
        }}
      >
        Test
      </button>
    </main>
  );
}
