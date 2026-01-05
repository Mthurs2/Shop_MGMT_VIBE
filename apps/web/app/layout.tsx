import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Auto Shop Management',
  description: 'Multi-tenant auto shop management platform'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
