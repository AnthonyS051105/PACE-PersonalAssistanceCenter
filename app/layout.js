import "./globals.css";

export const metadata = {
  title: "PACE - Personal Assistance Center",
  description: "Personal Assistance Center - Your all-in-one dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-nexus-deep text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
