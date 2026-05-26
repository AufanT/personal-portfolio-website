import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import '@/styles/globals.css';
import Shell from '@/components/Shell';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    template: '%s - Aufan Taufiqurrahman',
    default: 'Aufan Taufiqurrahman - Personal Portfolio',
  },
  description: 'Personal portfolio website of Aufan Taufiqurrahman, an Informatics Student, Web Developer, and Cybersecurity Enthusiast. Built with Next.js, Tailwind CSS, and Supabase.',
  keywords: ['Aufan Taufiqurrahman', 'Informatics', 'Portfolio', 'Web Developer', 'Cybersecurity', 'Next.js', 'Tailwind', 'Supabase'],
  authors: [{ name: 'Aufan Taufiqurrahman' }],
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Aufan Taufiqurrahman | Personal Portfolio',
    description: 'Informatics Student, Web Developer, and Cybersecurity Enthusiast.',
    type: 'website',
    images: ['/images/preview-website.gif'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aufan Taufiqurrahman | Personal Portfolio',
    description: 'Informatics Student, Web Developer, and Cybersecurity Enthusiast.',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark scroll-smooth overflow-x-hidden overflow-y-auto`}>
      <body className="bg-background text-on-background min-h-screen flex flex-col font-sans antialiased selection:bg-primary-container selection:text-background">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-container focus:text-black focus:font-mono focus:text-sm focus:rounded focus:shadow-neon">
          Skip to main content
        </a>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
