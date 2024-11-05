import "~/styles/globals.css";

import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";

import { TRPCReactProvider } from "~/trpc/react";

// Dynamically import the client-side dependencies component without server-side rendering (SSR)
const DynamicClientDependencies = dynamic(
  () => import("./_components/client-dependencies"),
  {
    ssr: false, // Disable SSR for this component
  },
);

// Configure the Inter font with specific settings
const inter = Inter({
  subsets: ["latin"], // Load only the Latin subset for performance optimization
  variable: "--font-sans", // CSS variable for the font
});

// Metadata for the document, including title and favicon
export const metadata = {
  title: "S4", // Title of the page
  icons: [{ rel: "icon", url: "/sphn-logo.png" }], // Favicon configuration
};

// Root layout component that wraps the entire application
export default function RootLayout({
  children,
}: {
  children: React.ReactNode; // Children components to be rendered inside the layout
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        {/* TRPC provider for managing API calls with cookies */}
        <TRPCReactProvider cookies={cookies().toString()}>
          {children} {/* Render the page's main content */}
        </TRPCReactProvider>
        <DynamicClientDependencies /> {/* Load client-side dependencies */}
      </body>
    </html>
  );
}
