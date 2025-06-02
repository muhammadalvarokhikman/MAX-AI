import './globals.css';
import type { Metadata } from 'next';
import { Inter, Orbitron } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
});

const orbitron = Orbitron({ 
  subsets: ['latin'],
  variable: '--font-orbitron'
});

export const metadata: Metadata = {
  title: 'MAX AI - Advanced RAG Chatbot',
  description: 'Interact with MAX AI, a cutting-edge chatbot powered by Retrieval-Augmented Generation technology',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${orbitron.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}