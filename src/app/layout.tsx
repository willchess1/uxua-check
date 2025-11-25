import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseProvider } from '@/lib/firebase/provider';

export const metadata: Metadata = {
  title: 'UXUA Housekeeping Checklist',
  description: 'Checklist de Manutenção das Casas UXUA',
  manifest: '/manifest.webmanifest'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background">
        <FirebaseProvider>
          {children}
          <Toaster />
        </FirebaseProvider>
      </body>
    </html>
  );
}