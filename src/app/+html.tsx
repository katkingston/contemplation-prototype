/**
 * Web HTML shell. Two phone-Safari fixes from MP's review (Sep 2026):
 * - `100dvh` sizing: classic 100%/100vh includes the strip under Safari's
 *   collapsed toolbar, which pushed bottom-anchored links slightly off-screen
 *   ("you have to scroll slightly to access the NEXT button").
 * - `viewport-fit=cover` so the app paints edge to edge on notched phones.
 */
import { ScrollViewStyleReset } from 'expo-router/html';
import React from 'react';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
html, body, #root { height: 100%; }
@supports (height: 100dvh) {
  html, body, #root { height: 100dvh; }
}
body { overscroll-behavior: none; background: #eaeae2; }
`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
