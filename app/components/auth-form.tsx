"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json().catch(() => ({ error: "Unexpected response" }));
      if (!response.ok) {
        setError(payload.error ?? "Request failed.");
        return;
      }

      if (mode === "register") {
        router.push("/login");
      } else {
        const role = payload.user?.role;
        router.push(role === "admin" ? "/admin/ideas" : "/submitter/ideas");
      }

      router.refresh();
    } catch {
      setError("Unable to contact server.");
    } finally {
      setSubmitting(false);
    }
  }

  const isLogin = mode === "login";

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      aria-describedby={error ? "auth-error" : undefined}
    >
      <h1 className="text-2xl font-semibold text-slate-900">
        {isLogin ? "Login" : "Register"}
      </h1>
      <p className="text-sm text-slate-600">
        {isLogin
          ? "Sign in to continue to InnovatEPAM Portal."
          : "Create your submitter account for idea submissions."}
      </p>

      <label className="block text-sm font-medium text-slate-700" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        required
      />

      <label className="block text-sm font-medium text-slate-700" htmlFor="password">
        Password
      </label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        minLength={8}
        required
      />

      {error ? (
        <p id="auth-error" className="text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-70"
      >
        {submitting ? "Please wait..." : isLogin ? "Login" : "Create account"}
      </button>

      <p className="text-sm text-slate-600">
        {isLogin ? "Need an account?" : "Already have an account?"}{" "}
        <Link
          href={isLogin ? "/register" : "/login"}
          className="font-medium text-blue-700 underline"
        >
          {isLogin ? "Register" : "Login"}
        </Link>
      </p>
    </form>
  );
}
