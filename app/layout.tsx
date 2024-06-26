import Footer from '@/components/ui/Footer';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import ConvexClientProvider from './ConvexClientProvider';
import './globals.css';

let title = 'notesGPT - Take notes with your voice';
let description = 'Generate action items from your notes in seconds';
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
      <body className="h-full" suppressHydrationWarning={true}>
        <ConvexClientProvider>
          {children}
          <Analytics />
          <Footer />
          <Toaster position="bottom-left" reverseOrder={false} />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
