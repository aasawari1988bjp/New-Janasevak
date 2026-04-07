import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "sonner";
import PWAInstaller from "@/components/PWAInstaller";

export const metadata: Metadata = {
  title: "Jansevak ward 26 | Mrs. Aasawari Kedar Navare | BJP Corporator KDMC",
  description: "Jansevak ward 26 - Official app of BJP Corporator Mrs. Aasawari Kedar Navare - Ward 26 KDMC. Lodge complaints, connect with your representative, and stay updated with civic issues.",

export function generateViewport() {
  return {
    themeColor: "#FF9933",
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  };
}

  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Jansevak ward 26",
  },
  openGraph: {
    title: "Jansevak ward 26 | Mrs. Aasawari Kedar Navare",
    description: "Official civic app for Ward 26 KDMC - Lodge complaints and stay connected",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="f7cd043f-2f0b-4500-a548-677ae12f25de"
        />
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        <AuthProvider>
          {children}
        </AuthProvider>
        <PWAInstaller />
        <Toaster richColors position="top-center" />
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
