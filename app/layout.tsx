import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Flix - Movie Streaming Platform',
  description: 'A premium, distraction-free movie streaming experience.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark antialiased`}>
      <body className="bg-background text-on-background flex min-h-screen flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
