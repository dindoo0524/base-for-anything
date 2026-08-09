import Link from "next/link";
import { EntryCard, type Entry } from "@/components/entry-card";
import { SetupNotice } from "@/components/setup-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getEntries() {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return { entries: [] as Entry[], error: null };
    }

    const { data, error } = await supabase
      .from("entries")
      .select("id, title, content, created_at")
      .order("created_at", { ascending: false });

    return {
      entries: (data ?? []) as Entry[],
      error,
    };
  } catch {
    return { entries: [] as Entry[], error: new Error("Unable to load entries") };
  }
}

export default async function Home() {
  const configured = isSupabaseConfigured();
  const { entries, error } = configured
    ? await getEntries()
    : { entries: [] as Entry[], error: null };

  return (
    <main className="site-shell public-shell">
      <header className="hero">
        <p className="eyebrow">Base for Anything</p>
        <h1>함께 나누는 이야기</h1>
        <p className="hero-copy">
          소중한 소식과 기록을 한곳에 모아 가족과 편하게 나눕니다.
        </p>
      </header>

      {!configured ? <SetupNotice /> : null}

      {configured && error ? (
        <section className="notice notice-error" role="alert">
          <h2>내용을 불러오지 못했습니다</h2>
          <p>잠시 후 새로고침해 주세요. 문제가 계속되면 관리자에게 알려주세요.</p>
        </section>
      ) : null}

      {configured && !error && entries.length === 0 ? (
        <section className="empty-state">
          <h2>아직 등록된 내용이 없습니다</h2>
          <p>첫 번째 이야기가 등록되면 이곳에서 함께 볼 수 있습니다.</p>
        </section>
      ) : null}

      {configured && !error && entries.length > 0 ? (
        <section className="entry-list" aria-label="등록된 이야기">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </section>
      ) : null}

      <footer className="site-footer">
        <p>같은 주소에서 누구나 최신 내용을 확인할 수 있습니다.</p>
        <Link href="/login">관리</Link>
      </footer>
    </main>
  );
}
