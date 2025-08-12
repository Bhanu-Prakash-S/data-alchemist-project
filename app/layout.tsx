import "./globals.css";
import type { Metadata } from "next";
import Sidebar from "../components/Sidebar";

export const metadata: Metadata = {
  title: "Data Alchemist",
  description: "Fullstack task",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex">
          <Sidebar />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
