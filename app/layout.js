import { Ubuntu } from "next/font/google";
import "./globals.css";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["400", "700", "300", "500"],
  variable: "--font-ubuntu",
});

export const metadata = {
  title: "Curador.ia",
  description: "Curador.ia is a curation for accessibility",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${ubuntu.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
