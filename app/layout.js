import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";

export const metadata = {
  title: "PACE - Personal Assistance Center",
  description: "Personal Assistance Center - Your all-in-one dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
          rel="stylesheet"
        />
      </head>
      <body className="bg-nexus-deep text-foreground font-sans">
        <AuthProvider>
          {children}
          <div id="modal-root" />
        </AuthProvider>
      </body>
    </html>
  );
}

