import Link from "next/link";
import { notFound } from "next/navigation";
import { SetupNotice } from "@/components/setup-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type EntryDetailPageProps = {
  params: Promise<{ id: string }>;
};

type EntryDetail = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

async function getEntry(id: string) {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return { entry: null, error: null };
    }

    const { data, error } = await supabase
      .from("entries")
      .select("id, title, content, created_at")
      .eq("id", id)
      .maybeSingle();

    return { entry: data as EntryDetail | null, error };
  } catch {
    return { entry: null, error: new Error("Unable to load entry") };
  }
}

export default async function EntryDetailPage({
  params,
}: EntryDetailPageProps) {
  const configured = isSupabaseConfigured();
  const { id } = await params;

  if (!configured) {
    return (
      <main className="site-shell narrow-shell">
        <Link className="back-link" href="/">
          말씀편지 목록으로 돌아가기
        </Link>
        <SetupNotice />
      </main>
    );
  }

  const { entry, error } = await getEntry(id);

  if (error || !entry) notFound();

  const createdAt = new Date(entry.created_at);
  const readableDate = Number.isNaN(createdAt.getTime())
    ? "날짜 정보 없음"
    : dateFormatter.format(createdAt);

  return (
    <main className="site-shell narrow-shell detail-shell">
      <Link className="back-link" href="/">
        말씀편지 목록으로 돌아가기
      </Link>

      <article className="letter-detail">
        <p className="eyebrow">우리 가족 말씀편지</p>
        <h1>{entry.title}</h1>
        <time dateTime={entry.created_at}>{readableDate}</time>
        <div className="letter-divider" aria-hidden="true">
          · · ·
        </div>
        <div className="letter-content">{entry.content}</div>
      </article>

      <footer className="detail-footer">
        <p>사랑하는 가족에게, 오늘의 마음을 전합니다.</p>
      </footer>
    </main>
  );
}
