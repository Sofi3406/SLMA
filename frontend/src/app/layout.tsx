import type { Metadata } from 'next';
import './globals.css';
import AuthWrapper from '@/components/AuthWrapper';
import { LanguageProvider } from '@/contexts/LanguageContext';

export const metadata: Metadata = {
  title: 'Silte Lmat Mehber - Preserving Heritage, Building Community',
  description: 'Official platform for Silte Lmat Mehber community.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <AuthWrapper>{children}</AuthWrapper>
        </LanguageProvider>
      </body>
    </html>
  );
}