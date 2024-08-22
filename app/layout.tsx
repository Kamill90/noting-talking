import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import ConvexClientProvider from './ConvexClientProvider';
import { RecordingContextProvider } from './RecordingContext';

import { RecordingPanel } from './RecordingPanel';
import './globals.css';

let title = 'Create content with your voice';
let description =
  'Convert your voice notes into tweets, blog posts, summaries, loose notes and clear action items using AI.';
let url = 'https://usenotesgpt.com';
let ogimage = 'https://usenotesgpt.com/images/og-image.png';
let sitename = 'usenotesgpt.com';

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    images: [ogimage],
    title,
    description,
    url: url,
    siteName: sitename,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    images: [ogimage],
    title,
    description,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full" suppressHydrationWarning={true}>
        <ConvexClientProvider>
          <RecordingContextProvider>
            <RecordingPanel />
            {children}
            <Toaster position="bottom-left" reverseOrder={false} />
          </RecordingContextProvider>
        </ConvexClientProvider>
      </body>
      <GoogleTagManager gtmId="G-T9MVK85ZBJ" />
      <GoogleAnalytics gaId="G-T9MVK85ZBJ" />
    </html>
  );
}
