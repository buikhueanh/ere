import type { Metadata } from 'next';
import { Amiri, Monsieur_La_Doulaise, Nothing_You_Could_Do, Cormorant_Infant } from 'next/font/google';
import '../styles/globals.css';
import { CartProvider } from '@/context/CartProvider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/ui/CartDrawer';

// Rebrand (decision 010): Amiri replaces the former fonts (Inter +
// Cormorant Garamond) for body/heading/UI text — mapped to --font-serif
// (and aliased to --font-sans in globals.css) so every existing `font-sans`/
// `font-serif` class renders in the new typeface with no per-component
// edits needed. Monsieur La Doulaise is the script font for the wordmark
// and nav links (`font-script`). Cormorant Infant (`font-display`, with an
// italic style) and Nothing You Could Do (`font-handwriting`) were added
// for the newsletter signup module's headline treatment.
const amiri = Amiri({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

const monsieurLaDoulaise = Monsieur_La_Doulaise({
  variable: '--font-script',
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
});

const cormorantInfant = Cormorant_Infant({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['500'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const nothingYouCouldDo = Nothing_You_Could_Do({
  variable: '--font-handwriting',
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
});


export const metadata: Metadata = {
  title: {
    default: 'ère',
    template: '%s | ère',
  },
  description: 'Curated luxury fashion for the discerning.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${amiri.variable} ${monsieurLaDoulaise.variable} ${nothingYouCouldDo.variable} ${cormorantInfant.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">
        <CartProvider>
          <Navbar />
          <main className='flex-1'>{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
