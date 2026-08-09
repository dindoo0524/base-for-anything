import Link from "next/link";
import { redirect } from "next/navigation";
import { EntryForm } from "@/components/entry-form";
import { FamilyNav } from "@/components/family-nav";
import { SetupNotice } from "@/components/setup-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { getFamilyMember } from "@/lib/family";

export const dynamic = "force-dynamic";

export default async function WritePage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="site-shell narrow-shell">
        <Link className="back-link" href="/">소개 화면으로 돌아가기</Link>
        <SetupNotice />
      </main>
    );
  }

  const { member, profileError } = await getFamilyMember();

  if (!member) redirect("/login");

  return (
    <main className="app-shell write-shell">
      <FamilyNav
        active="write"
        displayName={member.displayName}
        role={member.role}
      />

      <section className="write-heading">
        <p className="eyebrow">New story</p>
        <h1>오늘의 마음 남기기</h1>
        <p>{member.displayName}님의 묵상과 이야기를 가족에게 전해보세요.</p>
      </section>

      {profileError ? (
        <section className="notice notice-error" role="alert">
          <h2>v2.0 데이터베이스 설정이 필요합니다</h2>
          <p>`002_family_members_and_roles.sql`을 SQL Editor에서 실행해 주세요.</p>
        </section>
      ) : null}

      <section className="panel write-panel">
        <EntryForm />
      </section>

      <p className="write-note">
        등록한 글은 외부에 공개되지 않고 로그인한 가족만 읽을 수 있습니다.
      </p>
    </main>
  );
}
