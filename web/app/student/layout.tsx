import { Inter } from "next/font/google";
import type { ReactNode } from "react";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function StudentRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className={inter.className}>{children}</div>;
}
