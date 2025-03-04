'use client';
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import TonProvider from '@/providers/TonProvider';
import SocketProvider from '@/providers/SocketProvider';
import { usePathname } from 'next/navigation';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});


export default function RootLayout({ children }) {
  const pathname = usePathname();

  // Check if the path starts with /boss
  if (pathname.startsWith('/boss')) {
    return <html lang="en">
      <body className={`${inter.variable} antialiased min-h-screen`}>
        {children}
        <Toaster />
      </body>
    </html>;
  }

  // Otherwise return the normal layout
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased min-h-screen relative bg-[url('/images/bg.png')] bg-cover bg-center bg-main-gradient bg-blend-overlay overflow-x-hidden overflow-y-hidden`}>
        <SocketProvider>
          <TonProvider>
            {children}
            <Toaster />
          </TonProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
