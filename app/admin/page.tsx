import Link from "next/link";
import { redirect } from "next/navigation";
import { EntryForm } from "@/components/entry-form";
import { SetupNotice } from "@/components/setup-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const configured = isSupabaseConfigured();

  if (!configured) {
    return (
      <main className="site-shell narrow-shell">
        <Link className="back-link" href="/">
          공개 화면으로 돌아가기
        </Link>
        <section className="panel">
          <p className="eyebrow">우리 가족 말씀편지</p>
          <h1>먼저 저장 공간을 연결해 주세요</h1>
          <SetupNotice compact />
        </section>
      </main>
    );
  }

  const supabase = await createClient();
  let isAuthenticated = false;
  let email = "관리자";

  try {
    const result = await supabase?.auth.getClaims();
    const claims = result?.data?.claims;
    isAuthenticated = Boolean(claims);

    if (typeof claims?.email === "string") {
      email = claims.email;
    }
  } catch {
    redirect("/login");
  }

  if (!isAuthenticated) redirect("/login");

  return (
    <main className="site-shell narrow-shell">
      <header className="admin-header">
        <div>
          <p className="eyebrow">우리 가족 말씀편지</p>
          <h1>오늘의 말씀과 마음 남기기</h1>
          <p className="signed-in">{email} 계정으로 로그인됨</p>
        </div>
        <form action={logout}>
          <button className="text-button" type="submit">
            로그아웃
          </button>
        </form>
      </header>

      <section className="panel">
        <p className="panel-copy">
          저장한 묵상과 편지는 가족이 보는 공개 화면에 최신순으로 표시됩니다.
        </p>
        <EntryForm />
      </section>

      <Link className="secondary-link" href="/">
        가족이 보는 화면에서 확인하기
      </Link>
    </main>
  );
}
