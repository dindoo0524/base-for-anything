import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { deleteEntry } from "@/app/admin/actions";
import { FamilyNav } from "@/components/family-nav";
import { SetupNotice } from "@/components/setup-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { getFamilyMember } from "@/lib/family";

export const dynamic = "force-dynamic";

type EntryDetailPageProps = {
  params: Promise<{ id: string }>;
};

type EntryDetail = {
  id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
};

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default async function EntryDetailPage({ params }: EntryDetailPageProps) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <main className="site-shell narrow-shell">
        <Link className="back-link" href="/">소개 화면으로 돌아가기</Link>
        <SetupNotice />
      </main>
    );
  }

  const { supabase, member } = await getFamilyMember();

  if (!supabase || !member) redirect("/login");

  const { data, error } = await supabase
    .from("entries")
    .select("id, title, content, author_id, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) notFound();

  const entry = data as EntryDetail;
  const { data: authorProfile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", entry.author_id)
    .maybeSingle();

  const authorName =
    typeof authorProfile?.display_name === "string"
      ? authorProfile.display_name
      : "가족";
  const createdAt = new Date(entry.created_at);
  const readableDate = Number.isNaN(createdAt.getTime())
    ? "날짜 정보 없음"
    : dateFormatter.format(createdAt);
  const canDelete = member.role === "admin" || member.id === entry.author_id;

  return (
    <main className="app-shell detail-shell">
      <FamilyNav
        active="family"
        displayName={member.displayName}
        role={member.role}
      />

      <Link className="back-link" href="/family">가족 글 목록으로</Link>

      <article className="letter-detail">
        <div className="detail-author">
          <span className="entry-avatar" aria-hidden="true">
            {authorName.trim().charAt(0) || "가"}
          </span>
          <div>
            <strong>{authorName}</strong>
            <time dateTime={entry.created_at}>{readableDate}</time>
          </div>
        </div>

        <p className="eyebrow">Family story</p>
        <h1>{entry.title}</h1>
        <div className="letter-content">{entry.content}</div>

        {canDelete ? (
          <form action={deleteEntry} className="detail-delete-form">
            <input type="hidden" name="entryId" value={entry.id} />
            <button className="delete-button" type="submit">이 글 삭제</button>
          </form>
        ) : null}
      </article>

      <p className="private-note">이 글은 로그인한 가족만 읽을 수 있습니다.</p>
    </main>
  );
}
