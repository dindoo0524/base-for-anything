import Link from "next/link";
import { redirect } from "next/navigation";
import { EntryCard, type Entry } from "@/components/entry-card";
import { FamilyNav } from "@/components/family-nav";
import { SetupNotice } from "@/components/setup-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { getFamilyMember, type FamilyProfile } from "@/lib/family";

export const dynamic = "force-dynamic";

type FamilyPageProps = {
  searchParams: Promise<{ notice?: string }>;
};

type EntryRow = Omit<Entry, "author_name">;

const noticeMessages: Record<string, string> = {
  deleted: "글을 삭제했습니다.",
  "delete-not-allowed": "삭제할 수 없습니다. 가족은 자신이 작성한 글만 삭제할 수 있습니다.",
  "delete-failed": "글을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.",
};

export default async function FamilyPage({ searchParams }: FamilyPageProps) {
  const configured = isSupabaseConfigured();

  if (!configured) {
    return (
      <main className="site-shell narrow-shell">
        <Link className="back-link" href="/">소개 화면으로 돌아가기</Link>
        <SetupNotice />
      </main>
    );
  }

  const { supabase, member, profileError } = await getFamilyMember();

  if (!supabase || !member) redirect("/login");

  const [{ data: entryRows, error: entriesError }, { data: profileRows }] =
    await Promise.all([
      supabase
        .from("entries")
        .select("id, title, content, author_id, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, display_name, role"),
    ]);

  const profileMap = new Map(
    ((profileRows ?? []) as FamilyProfile[]).map((profile) => [
      profile.id,
      profile.display_name,
    ]),
  );

  const entries = ((entryRows ?? []) as EntryRow[]).map((entry) => ({
    ...entry,
    author_name: profileMap.get(entry.author_id) ?? "가족",
  }));

  const params = await searchParams;
  const noticeMessage = params.notice ? noticeMessages[params.notice] : null;

  return (
    <main className="app-shell">
      <FamilyNav
        active="family"
        displayName={member.displayName}
        role={member.role}
      />

      <section className="family-hero">
        <div>
          <p className="eyebrow">Family board</p>
          <h1>우리 가족의 오늘</h1>
          <p>서로의 말씀과 마음을 천천히 읽어보세요.</p>
        </div>
        <Link className="round-action" href="/admin" aria-label="새 글 쓰기">
          <span aria-hidden="true">＋</span>
          글쓰기
        </Link>
      </section>

      {profileError ? (
        <section className="notice notice-error" role="alert">
          <h2>v2.0 데이터베이스 설정이 필요합니다</h2>
          <p>`002_family_members_and_roles.sql`을 SQL Editor에서 실행해 주세요.</p>
        </section>
      ) : null}

      {noticeMessage ? (
        <p className={`toast ${params.notice === "deleted" ? "toast-success" : "toast-error"}`} role="status">
          {noticeMessage}
        </p>
      ) : null}

      {entriesError ? (
        <section className="notice notice-error" role="alert">
          <h2>가족 글을 불러오지 못했습니다</h2>
          <p>v2.0 migration을 실행했는지 확인한 뒤 다시 시도해 주세요.</p>
        </section>
      ) : null}

      {!entriesError && entries.length === 0 ? (
        <section className="empty-state">
          <span className="empty-mark" aria-hidden="true">＋</span>
          <h2>첫 번째 가족 글을 남겨보세요</h2>
          <p>오늘 마음에 남은 말씀이나 전하고 싶은 이야기를 시작해 보세요.</p>
          <Link className="primary-link" href="/admin">첫 글 작성하기</Link>
        </section>
      ) : null}

      {!entriesError && entries.length > 0 ? (
        <section className="entry-list" aria-label="가족 글 목록">
          {entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              canDelete={member.role === "admin" || member.id === entry.author_id}
            />
          ))}
        </section>
      ) : null}
    </main>
  );
}
