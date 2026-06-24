// src/app/layout.tsx

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'supsaf',
  description: 'Explore verified travel destinations near you.',
  openGraph: {
    siteName: 'supsaf',
    title: 'supsaf',
    url: 'https://supsaf.in',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteNameJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'supsaf',
    url: 'https://supsaf.in',
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(siteNameJsonLd),
          }}
        />

        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1866248648616254"
          crossOrigin="anonymous"
        />
      </head>

      <body>{children}</body>
    </html>
  );
}
