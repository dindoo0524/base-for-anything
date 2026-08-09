import Link from "next/link";
import { redirect } from "next/navigation";
import { SetupNotice } from "@/components/setup-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { login } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

const errorMessages: Record<string, string> = {
  "missing-fields": "이메일과 비밀번호를 모두 입력해 주세요.",
  "invalid-credentials": "이메일 또는 비밀번호를 확인해 주세요.",
  "not-configured": "Supabase 연결을 먼저 완료해 주세요.",
  "connection-failed": "로그인 서비스에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const configured = isSupabaseConfigured();

  if (configured) {
    try {
      const supabase = await createClient();
      const { data } = (await supabase?.auth.getClaims()) ?? { data: null };

      if (data?.claims) {
        redirect("/admin");
      }
    } catch {
      // Keep the login page available and show connection errors on submit.
    }
  }

  const params = await searchParams;
  const errorMessage = params.error ? errorMessages[params.error] : null;

  return (
    <main className="site-shell narrow-shell">
      <Link className="back-link" href="/">
        말씀편지 목록으로 돌아가기
      </Link>

      <section className="panel auth-panel">
        <p className="eyebrow">우리 가족 말씀편지</p>
        <h1>글쓴이 로그인</h1>
        <p className="panel-copy">
          권사님 계정으로 로그인하면 묵상과 편지를 새로 남길 수 있습니다.
        </p>

        {!configured ? <SetupNotice compact /> : null}

        {errorMessage ? (
          <p className="form-message form-error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <form action={login} className="form-stack">
          <label htmlFor="email">이메일</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={!configured}
          />

          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={!configured}
          />

          <button className="primary-button" type="submit" disabled={!configured}>
            로그인
          </button>
        </form>
      </section>
    </main>
  );
}
