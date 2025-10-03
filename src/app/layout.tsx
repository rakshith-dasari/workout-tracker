import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import AppSidebar from "@/components/AppSidebar";
import { SidebarSpacer } from "@/components/ui/sidebar";
import { AuthProvider } from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Workout Tracker",
  description: "Workout Tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <div className="min-h-screen flex flex-col">
              <div className="flex flex-1">
                <SidebarSpacer />
                <div className="flex-1 pt-16 md:pt-0">{children}</div>
              </div>
            </div>

            {/* Sidebar - handles its own responsive behavior */}
            <AppSidebar />

            <Toaster richColors closeButton position="top-right" />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
