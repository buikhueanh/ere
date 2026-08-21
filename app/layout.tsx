import type { Metadata } from 'next';
import { Amiri, Monsieur_La_Doulaise, Nothing_You_Could_Do, Cormorant_Infant } from 'next/font/google';
import '../styles/globals.css';
import { CartProvider } from '@/context/CartProvider';
import { AnnouncementBarProvider } from '@/components/layout/AnnouncementBarContext';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/ui/CartDrawer';
import { getVendors } from '@/lib/shopify/vendors';

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const vendors = await getVendors();

  return (
    <html lang="en" className={`${amiri.variable} ${monsieurLaDoulaise.variable} ${nothingYouCouldDo.variable} ${cormorantInfant.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">
        <CartProvider>
          <AnnouncementBarProvider>
            <AnnouncementBar />
            <Navbar vendors={vendors} />
          </AnnouncementBarProvider>
          <main className='flex-1'>{children}</main>
           {/* Scroll buffer taller than the sticky navbar (~84px) so that on
              short pages the last pre-footer content (e.g. shop's page
              selector) can scroll fully behind the navbar before the
              document hits its max scroll — otherwise it's left peeking out
              beneath it. */}
          <div aria-hidden className="h-5 shrink-0" />
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
