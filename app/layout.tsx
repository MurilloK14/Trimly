import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display, Rye } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const rye = Rye({
  subsets: ["latin"],
  variable: "--font-rye",
  weight: "400",
});

export const metadata: Metadata = {
  title: 'MK Barber | Sistema de Gestão para Barbearias',
  description: 'Plataforma moderna para gestão de barbearias. Agendamentos, clientes e muito mais.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#1a1a1f',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="dark bg-background">
      <body className={`${inter.variable} ${playfair.variable} ${rye.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
