import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserFromCookies } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUserFromCookies();

  if (user?.role === "admin") {
    redirect("/admin/ideas");
  }

  if (user?.role === "submitter") {
    redirect("/submitter/ideas");
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 items-center p-6">
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Manage Innovation Ideas Locally</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          InnovatEPAM Portal lets submitters share ideas with one attachment and enables admins
          to review, comment, and update statuses through a simple local MVP workflow.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Register as Submitter
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Login
          </Link>
        </div>

        <ul className="mt-8 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
          <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            Submitters create ideas with title, description, category, and one attachment.
          </li>
          <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            Admins review all submissions, set statuses, and leave evaluation comments.
          </li>
        </ul>
      </section>
    </main>
  );
}
