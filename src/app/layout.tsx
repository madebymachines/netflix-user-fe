import type { Metadata } from 'next'
import './globals.css'
// import { urw, gravtrac, vancouver, vancouverGothic } from "./fonts";
import DesktopGate from '@/components/DesktopGate'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Netflix - 100 PLUS',
  description: 'Unlock Your 100 Challenge',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        // className={`${urw.variable} ${gravtrac.variable} ${vancouver.variable} ${vancouverGothic.variable} bg-black antialiased`}
        className="bg-black antialiased"
      >
        {children}
        {/* <DesktopGate>{children}</DesktopGate> */}
      </body>
    </html>
  )
}
