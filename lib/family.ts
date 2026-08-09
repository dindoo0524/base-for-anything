import { createClient } from "@/lib/supabase/server";

export type FamilyRole = "admin" | "member";

export type FamilyProfile = {
  id: string;
  display_name: string;
  role: FamilyRole;
};

export async function getFamilyMember() {
  const supabase = await createClient();

  if (!supabase) {
    return { supabase: null, member: null, profileError: null };
  }

  const { data: claimsData, error: authError } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  const userId = typeof claims?.sub === "string" ? claims.sub : null;
  const email = typeof claims?.email === "string" ? claims.email : "";

  if (authError || !userId) {
    return { supabase, member: null, profileError: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, display_name, role")
    .eq("id", userId)
    .maybeSingle();

  const fallbackName = email.split("@")[0] || "가족";
  const role: FamilyRole = profile?.role === "admin" ? "admin" : "member";

  return {
    supabase,
    member: {
      id: userId,
      email,
      displayName:
        typeof profile?.display_name === "string"
          ? profile.display_name
          : fallbackName,
      role,
    },
    profileError,
  };
}
