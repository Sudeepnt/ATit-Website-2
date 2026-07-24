import { Cormorant_Garamond, IBM_Plex_Sans } from "next/font/google";
import { CookieBanner } from "../components/cookie-banner";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const ibmPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: "ATit",
  description: "ATit real estate platform website clone.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${ibmPlex.variable}`}>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
