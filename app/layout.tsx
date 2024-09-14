'use client'

import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import { Toaster } from 'react-hot-toast';
import ConvexClientProvider from './ConvexClientProvider';
import { RecordingContextProvider } from './RecordingContext';
import { usePathname } from 'next/navigation';
import Layout from '../components/Layout';
import Banner from '../components/pages/home/Banner';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

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
            <Layout isLandingPage={isLandingPage}>
              {isLandingPage ? <Banner /> : children}
            </Layout>
            <Toaster position="bottom-left" reverseOrder={false} />
          </RecordingContextProvider>
        </ConvexClientProvider>
        <GoogleTagManager gtmId="G-T9MVK85ZBJ" />
        <GoogleAnalytics gaId="G-T9MVK85ZBJ" />
      </body>
    </html>
  );
}
