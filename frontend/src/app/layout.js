import "./globals.css";

const geistSans = { variable: "font-sans" };
const geistMono = { variable: "font-mono" };

import { getApiUrl } from "@/utils/getApiUrl";

export async function generateMetadata() {
  const apiUrl = getApiUrl();
  const defaultMetadata = {
    title: {
      default: "Kids Item Shop | Multi-Category E-Commerce Store",
      template: "%s | Kids Item Shop",
    },
    description: "Your trusted destination for quality products at great value. Discover everyday essentials, lifestyle products & more, delivered conveniently across Bangladesh.",
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://kidsitembd.com"),
    alternates: {
      canonical: "/",
    },
  };

  try {
    const res = await fetch(`${apiUrl}/settings`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(500),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.siteName) {
        defaultMetadata.title = {
          default: `${data.siteName} | E-Commerce Store`,
          template: `%s | ${data.siteName}`,
        };
      }
      if (data?.logo) {
        const iconSource = data.logo.startsWith("data:image/") ? data.logo : `${apiUrl}/settings/logo`;
        defaultMetadata.icons = {
          icon: iconSource,
          shortcut: iconSource,
          apple: iconSource,
        };
      }
    }
  } catch {
    // Quiet fallback if backend is unreachable during SSR
  }

  return defaultMetadata;
}

import NextTopLoader from "nextjs-toploader";
import Providers from "@/components/Providers";
import MainLayout from "@/layouts/MainLayout";

export default function RootLayout({ children }) {
  const apiUrl = getApiUrl();
  const apiOrigin = apiUrl.startsWith("http") ? new URL(apiUrl).origin : null;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {apiOrigin && (
          <>
            <link rel="preconnect" href={apiOrigin} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={apiOrigin} />
          </>
        )}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <NextTopLoader color="#8b5cf6" showSpinner={false} height={3} crawl={true} speed={200} />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
