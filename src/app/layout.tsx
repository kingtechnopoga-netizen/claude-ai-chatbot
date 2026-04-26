export const metadata = {
  title: 'Claude AI Chatbot',
  description: 'AI Chatbot UI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}