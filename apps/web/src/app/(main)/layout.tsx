import Image from "next/image";
import Link from "next/link";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="px-8 py-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center justify-center  font-semibold">
          <Image
            src={"/appIcon.png"}
            height={50}
            width={30}
            alt="appIcon"
          ></Image>
          <span className="text-primary text-xl">Spectre</span>
          <span className="text-text-muted text-xs">.io</span>
        </div>
        <nav className="text-sm text-text-muted flex gap-6">
          <Link
            href="/room"
            className="px-8 py-3   rounded-lg bg-primary text-black font-semibold hover:bg-accent transition"
          >
            Launch App
          </Link>
        </nav>
      </header>

      <main className="flex-1  justify-center items-center flex">
        {children}
      </main>

      <footer className="px-8 py-6 border-t border-border text-center text-xs text-text-muted">
        Secure ephemeral realtime transport — Powered by Amir Hossein Noshad
      </footer>
    </>
  );
}
