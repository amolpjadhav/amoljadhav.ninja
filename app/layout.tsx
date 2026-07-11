import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Amol Jadhav | Sr. Engineering Program Manager",
  description: "Personal website of Amol Jadhav - Sr. Engineering Program Manager, Bar Raiser at Amazon. Blog, projects, and AI assistant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script src="https://use.fontawesome.com/releases/v6.3.0/js/all.js" crossOrigin="anonymous" async></script>
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
