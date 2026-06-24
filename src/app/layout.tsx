import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeContext';

export const metadata: Metadata = {
  title: 'Smart Task Manager',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" data-theme="dark">
      <body style={{ margin: 0 }}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
