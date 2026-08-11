import { AuthForm } from "@/components/auth-form";
import { BibleHunter } from "@/components/bible-hunter";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
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

  return <BibleHunter authenticatedUser={{ id: user.id, name: nickname || fallbackNickname }} />;
}
