import { AuthForm } from "@/components/auth-form";
import { BibleHunterV1 } from "@/components/bible-hunter-v1";
import { BibleHunterV2 } from "@/components/bible-hunter";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

type UiVersion = "v1" | "v2";

export async function BibleHunterPage({ version }: { version: UiVersion }) {
  const configured = isSupabaseConfigured();

  if (!configured) {
    return <AuthForm configured={false} />;
  }

  const supabase = await createClient();
  const { data: { user } } = (await supabase?.auth.getUser()) ?? { data: { user: null } };

  if (!user) {
    return <AuthForm configured />;
  }

  const { data: profile } = await supabase!
    .from("profiles")
    .select("nickname")
    .eq("id", user.id)
    .maybeSingle();

  const fallbackNickname = String(user.user_metadata.nickname || user.email?.split("@")[0] || "Hunter").trim().slice(0, 20) || "Hunter";
  let nickname = profile?.nickname;

  if (!nickname) {
    const { data: createdProfile } = await supabase!
      .from("profiles")
      .upsert({ id: user.id, nickname: fallbackNickname }, { onConflict: "id" })
      .select("nickname")
      .single();
    nickname = createdProfile?.nickname;
  }

  const authenticatedUser = { id: user.id, name: nickname || fallbackNickname };

  return version === "v1"
    ? <BibleHunterV1 authenticatedUser={authenticatedUser} />
    : <BibleHunterV2 authenticatedUser={authenticatedUser} />;
}
