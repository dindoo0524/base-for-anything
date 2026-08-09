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
        <p className="eyebrow">우리 가족 말씀편지</p>
        <h1>오늘도 말씀 안에서,<br />우리 함께</h1>
        <p className="hero-copy">
          묵상한 말씀과 사랑하는 가족에게 전하고 싶은 마음을 이곳에
          차곡차곡 남깁니다.
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
          <h2>아직 도착한 말씀편지가 없습니다</h2>
          <p>첫 묵상이나 편지가 등록되면 이곳에서 함께 읽을 수 있습니다.</p>
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
        <p>멀리 있어도 같은 말씀과 마음을 함께 나눕니다.</p>
        <Link href="/login">말씀편지 쓰기</Link>
      </footer>
    </main>
  );
}
