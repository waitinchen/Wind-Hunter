import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: '獵風男團 · Wind Hunter',
    description: '基於心風算法的互動式 WebGame',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="zh-TW">
            <body>{children}</body>
        </html>
    )
}
