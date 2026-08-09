const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

export function getSupabaseEnv() {
  if (!supabaseUrl || !supabasePublishableKey) {
    return null;
  }

  return {
    url: supabaseUrl,
    publishableKey: supabasePublishableKey,
  };
}

export function isSupabaseConfigured() {
  return getSupabaseEnv() !== null;
}
