import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
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
  title: "TeachMaster AI | Learn by Teaching",
  description: "Master any subject by teaching an AI student. Based on the proven Feynman Technique for deeper understanding and retention.",
  keywords: ["learning", "teaching", "AI", "education", "Feynman technique", "study"],
  authors: [{ name: "TeachMaster AI" }],
  openGraph: {
    title: "TeachMaster AI | Learn by Teaching",
    description: "Master any subject by teaching an AI student",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark-mode">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
