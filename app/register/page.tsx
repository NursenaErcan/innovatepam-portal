import AuthForm from "@/app/components/auth-form";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center p-6">
      <AuthForm mode="register" />
    </main>
  );
}
