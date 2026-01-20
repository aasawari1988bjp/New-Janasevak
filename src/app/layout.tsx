import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "जनसेवक | Jansevak - Mrs. Aasawari Kedar Navare | BJP Corporator Ward 26 KDMC",
  description: "जनसेवक - वॉर्ड 26 नागरिक पोर्टल | Official app of BJP Corporator Mrs. Aasawari Kedar Navare - Ward 26 KDMC. Lodge complaints, connect with your representative.",
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
        <Toaster richColors position="top-center" />
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
