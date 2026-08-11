"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

export function AuthForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [pending, setPending] = useState(false);

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setMessage("");
    setIsError(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    if (!configured) {
      setIsError(true);
      setMessage("Supabase 환경 변수를 먼저 설정해 주세요.");
      return;
    }

    const trimmedEmail = email.trim();
    const trimmedNickname = nickname.trim().replace(/\s+/g, " ");
    if (!trimmedEmail || !password || (mode === "signup" && !trimmedNickname)) {
      setIsError(true);
      setMessage("모든 항목을 입력해 주세요.");
      return;
    }
    if (password.length < 6) {
      setIsError(true);
      setMessage("비밀번호는 6자 이상 입력해 주세요.");
      return;
    }

    const supabase = createClient();
    if (!supabase) return;
    setPending(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: { data: { nickname: trimmedNickname } },
        });
        if (error) throw error;
        if (!data.session) {
          setMessage("가입 확인 메일을 보냈습니다. 이메일 인증 후 로그인해 주세요.");
          setMode("login");
          setPassword("");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
        if (error) throw error;
      }
      router.refresh();
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "인증 처리 중 문제가 발생했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="app auth-app">
      <header className="brand"><span className="brand-mark" aria-hidden="true">✦</span><span>Bible Hunter</span></header>
      <section className="screen input-screen auth-screen" aria-labelledby="auth-title">
        <div className="auth-tabs" role="tablist" aria-label="인증 방식">
          <button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "is-active" : ""} onClick={() => changeMode("login")}>로그인</button>
          <button type="button" role="tab" aria-selected={mode === "signup"} className={mode === "signup" ? "is-active" : ""} onClick={() => changeMode("signup")}>회원가입</button>
        </div>
        <div className="step-label">WELCOME, HUNTER</div>
        <h1 id="auth-title">{mode === "login" ? <>다시 만난<br />오늘의 말씀</> : <>함께 시작할<br />QT 여정</>}</h1>
        <p className="lead">{mode === "login" ? "이메일과 비밀번호로 로그인해 주세요." : "계정에 사용할 이메일과 별명을 등록해 주세요."}</p>
        {!configured && <p className="auth-notice">`.env.local`에 Supabase 환경 변수를 설정해야 사용할 수 있습니다.</p>}
        <form onSubmit={submit} noValidate>
          {mode === "signup" && <><label htmlFor="nickname">별명</label><input id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={20} autoComplete="nickname" placeholder="예: 다윗" disabled={pending} /></>}
          <label htmlFor="email">이메일</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="hunter@example.com" disabled={pending} />
          <label htmlFor="password">비밀번호</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={6} placeholder="6자 이상 입력" disabled={pending} />
          <p className={`form-message${message ? " is-visible" : ""}${isError ? " is-error" : ""}`} role={isError ? "alert" : "status"}>{message}</p>
          <button className="primary-button" type="submit" disabled={pending || !configured}>{pending ? "처리 중..." : mode === "login" ? "로그인" : "회원가입"}<span aria-hidden="true">→</span></button>
        </form>
      </section>
    </main>
  );
}
