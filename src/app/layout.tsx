import "./globals.css";
export const metadata = {
  title: "Neural Interface",
  description: "Advanced AI Chatbot UI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}