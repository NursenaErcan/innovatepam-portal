import { redirect } from "next/navigation";
import { requireRoleForPage } from "@/lib/auth";

export default async function AdminPage() {
  await requireRoleForPage("admin");
  redirect("/admin/ideas");
}
