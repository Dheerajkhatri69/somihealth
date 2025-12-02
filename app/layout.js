import { AuthProvider } from "./Providers";
import WebsiteDataProviderWrapper from "@/components/WebsiteDataProvider";
import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL("https://www.app-joinsomi.com"),
  title: "Async", // <-- FIXED: No template, no auto suffix
  description: "Async — sign in to your account",
  applicationName: "Async",
  openGraph: {
    title: "Async",
    siteName: "Async",
    description: "Async — sign in to your account",
    url: "https://www.app-joinsomi.com",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Async",
    description: "Async — sign in to your account",
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body className={inter.className}>
        <Toaster position="top-center" />
        <AuthProvider>
          <WebsiteDataProviderWrapper>
            {children}
          </WebsiteDataProviderWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}