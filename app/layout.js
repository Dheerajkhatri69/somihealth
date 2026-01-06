import { AuthProvider } from "./Providers";
import WebsiteDataProviderWrapper from "@/components/WebsiteDataProvider";
import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL("https://www.joinsomi.com"),
  title: "Somi Health", // <-- FIXED: No template, no auto suffix
  description: "Somi Health",
  applicationName: "Async",
  openGraph: {
    title: "Somi Health",
    siteName: "Somi Health",
    description: "Somi Health",
    url: "https://www.joinsomi.com",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Somi Health",
    description: "Somi Health",
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