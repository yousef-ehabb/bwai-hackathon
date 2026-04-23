import type { Metadata } from "next";
import { Syne, Manrope } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Bootstrapper from "@/components/Bootstrapper";
import NotificationProvider from "@/components/NotificationProvider";
import { Toaster } from "@/components/ui/sonner";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-syne",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UrbanFix — AI-Powered City Infrastructure Reporting",
  description:
    "Bridge the gap between citizens and municipal authorities. Report, track, and resolve city infrastructure issues in real time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${manrope.variable} h-full`}>
      <body className="font-manrope min-h-full antialiased">
        <Bootstrapper />
        <AuthProvider>
          <NotificationProvider>
            {children}
            <Toaster richColors position="top-right" />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
