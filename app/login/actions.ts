"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=missing-fields");
  }

  const supabase = await createClient();

  if (!supabase) {
    redirect("/login?error=not-configured");
  }

  let loginFailed = false;

  try {
    const result = await supabase.auth.signInWithPassword({ email, password });
    loginFailed = Boolean(result.error);
  } catch {
    redirect("/login?error=connection-failed");
  }

  if (loginFailed) {
    redirect("/login?error=invalid-credentials");
  }

  redirect("/family");
}
