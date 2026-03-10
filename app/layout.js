import './globals.css'
import { Poppins } from 'next/font/google'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/sonner'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400','500','600','700'],
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'Tadabbur Quran - Kelas Online Tafsir & Tahfizh',
    template: '%s | Tadabbur Quran'
  },
  description: 'Platform pembelajaran Quran dengan metode tadabbur yang mendalam. Belajar tafsir, tahfizh, dan ilmu Quran dari ustadz-ustadz terpercaya.',
  keywords: ['tadabbur quran', 'tafsir quran', 'tahfizh', 'kelas quran online', 'belajar quran', 'kursus islami'],
  authors: [{ name: 'Tadabbur Quran' }],
  creator: 'Tadabbur Quran',
  publisher: 'Tadabbur Quran',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    title: 'Tadabbur Quran - Kelas Online Tafsir & Tahfizh',
    description: 'Platform pembelajaran Quran dengan metode tadabbur yang mendalam',
    siteName: 'Tadabbur Quran',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Tadabbur Quran'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tadabbur Quran - Kelas Online Tafsir & Tahfizh',
    description: 'Platform pembelajaran Quran dengan metode tadabbur yang mendalam',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || '',
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className={`min-h-screen ${poppins.className}`}>
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}
