import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

/**
 * One family, used across its full range. Bricolage Grotesque's optical-size
 * and width axes give a crisp display cut for headlines and a calm text cut
 * for body, so contrast comes from weight and width, not from a second face.
 */
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
});

export const metadata: Metadata = {
  title: "FESKUM 2026 · Universiti Malaya Convocation Festival",
  description:
    "Six days. Countless moments. One celebration. Explore every event of the Universiti Malaya Convocation Festival.",
};

export const viewport: Viewport = {
  themeColor: "#f6f1ea",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={bricolage.variable}
    >
      <body>
        {children}
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
