import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { AppDataProvider } from "@/components/providers/app-data-provider";
import { AppShell } from "@/components/layout/app-shell";
import { RegisterSW } from "@/components/pwa/register-sw";
import { ReminderScheduler } from "@/components/pwa/reminders";
import { AchievementChecker } from "@/components/providers/achievement-checker";
import { InstallListener } from "@/components/pwa/install-listener";
import { APP_NAME } from "@/constants";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: { default: `${APP_NAME} - Study in order, master every topic`, template: `%s | ${APP_NAME}` },
  description:
    "A structured reviewer that helps students study in the same order their teacher teaches - units, lessons, topics, flashcards and quizzes that stay organized.",
  applicationName: APP_NAME,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/apple-touch-icon.png"
  }
};

export const viewport: Viewport = {
  themeColor: "#EC4899",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AppDataProvider>
          <RegisterSW />
          <InstallListener />
          <ReminderScheduler />
          <AchievementChecker />
          {children}
          <Toaster position="top-center" richColors />
        </AppDataProvider>
      </body>
    </html>
  );
}
