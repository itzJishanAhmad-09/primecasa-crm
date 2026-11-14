import "./globals.css";

export const metadata = {
  title: "Prime Casa CRM",
  description: "Real-estate lead management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}