import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="dark">
      <Head />
      <title>Byte Notes</title>
      <link rel="icon" href="/ByteNotes.png" /> 
      <meta
        name="description"
        content="Byte Notes is a notetaking web app for Computer Science students."
      />
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
