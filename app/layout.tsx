import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://amoljadhav.ai"),
  title: "Amol Jadhav",
  description: "Personal site of Amol Jadhav — blog and writing on AI and software engineering.",
  openGraph: {
    title: "Amol Jadhav",
    description: "Personal site of Amol Jadhav — blog and writing on AI and software engineering.",
    url: "https://amoljadhav.ai",
    siteName: "Amol Jadhav",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Amol Jadhav",
    description: "Personal site of Amol Jadhav — blog and writing on AI and software engineering.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <head>
        <script src="https://use.fontawesome.com/releases/v6.3.0/js/all.js" crossOrigin="anonymous" async></script>
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
