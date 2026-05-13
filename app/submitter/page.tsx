import { redirect } from "next/navigation";
import { requireRoleForPage } from "@/lib/auth";

export default async function SubmitterPage() {
  await requireRoleForPage("submitter");
  redirect("/submitter/ideas");
}
