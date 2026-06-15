import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Plus Jakarta Sans: a modern geometric sans, distinctive but composed, for a console that should
// look considered, not generic. JetBrains Mono carries the figures and rule ids.
const sans = Plus_Jakarta_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const mono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Newcomer Credit Copilot",
  description:
    "Explainable, policy-grounded credit decisions for UAE newcomers. Every recommendation cited, every decision auditable.",
};

// Apply the saved theme before first paint so there is no flash of the wrong theme.
const themeInit = `(function(){try{var t=localStorage.getItem("ncc.theme");if(t==="dark"||(!t&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark");}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // The theme-init script sets the `dark` class on <html> before hydration, so the class list
      // intentionally differs from the server render. Suppress the expected mismatch on this node.
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
