import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import LogoutButton from "@/app/components/logout-button";
import { getCurrentUserFromCookies } from "@/lib/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InnovatEPAM Portal",
  description: "Employee innovation management MVP",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUserFromCookies();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50 text-slate-900">
        <div className="min-h-full flex flex-col">
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between p-4">
              <Link href="/" className="text-lg font-semibold text-slate-900">
                InnovatEPAM Portal
              </Link>

              <nav className="flex items-center gap-3 text-sm">
                {!user ? (
                  <>
                    <Link className="text-slate-700 hover:text-slate-900" href="/login">
                      Login
                    </Link>
                    <Link className="text-slate-700 hover:text-slate-900" href="/register">
                      Register
                    </Link>
                  </>
                ) : (
                  <>
                    <span className="text-slate-600">{user.email}</span>
                    {user.role === "admin" ? (
                      <Link className="text-slate-700 hover:text-slate-900" href="/admin/ideas">
                        Admin Ideas
                      </Link>
                    ) : (
                      <Link className="text-slate-700 hover:text-slate-900" href="/submitter/ideas">
                        My Ideas
                      </Link>
                    )}
                    <LogoutButton />
                  </>
                )}
              </nav>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
