import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";
import { Metadata } from "next";
export const metadata: Metadata = { title: "Spectre.io" };
const layout = ({ children }: LayoutProps<"/">) => {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-bg text-text">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
};

export default layout;
