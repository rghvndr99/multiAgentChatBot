import "./globals.css";

export const metadata = {
  title: "LangChain Chat",
  description: "A simple Next.js and LangChain chat application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
