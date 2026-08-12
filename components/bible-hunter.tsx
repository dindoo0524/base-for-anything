"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const CONFIG = {
  minReflection: 50,
  maxReflection: 100,
} as const;

type Screen = "scripture" | "reflection" | "dashboard";
type User = { id: string; name: string; createdAt: string };
type Entry = {
  id: string;
  userId: string;
  date: string;
  scripture: string;
  reflection: string;
  createdAt: string;
  updatedAt: string;
};
type Comment = {
  id: string;
  entryId: string;
  authorId: string;
  parentCommentId: string | null;
  content: string;
  createdAt: string;
};

const pad = (value: number) => String(value).padStart(2, "0");
const localDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};
const formatDate = (value: string) => {
  const [, month, day] = value.split("-");
  return `${Number(month)}월 ${Number(day)}일`;
};
const formatCommentTime = (value: string) => new Intl.DateTimeFormat("ko-KR", {
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
}).format(new Date(value));

export function BibleHunter({ authenticatedUser }: { authenticatedUser: { id: string; name: string } }) {
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [scripture, setScripture] = useState("");
  const [reflection, setReflection] = useState("");
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(localDate);
  const [dailyScripture, setDailyScripture] = useState("");
  const [scriptureError, setScriptureError] = useState("");
  const [reflectionError, setReflectionError] = useState("");
  const [modalEntry, setModalEntry] = useState<Entry | null>(null);
  const [toast, setToast] = useState("");
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [commentError, setCommentError] = useState("");
  const [savingComment, setSavingComment] = useState(false);
  const modalRef = useRef<HTMLElement>(null);

  const today = localDate();
  const calendarYear = Number(today.slice(0, 4));
  const calendarMonth = Number(today.slice(5, 7));
  const targetMonth = `${calendarYear}-${pad(calendarMonth)}-`;
  const days = Array.from({ length: new Date(calendarYear, calendarMonth, 0).getDate() }, (_, i) => i + 1);
  const targetDate = (day: number) => `${targetMonth}${pad(day)}`;
  const currentUser = users.find((user) => user.id === currentUserId);

  useEffect(() => {
    async function loadSharedData() {
      const supabase = createClient();
      if (!supabase) return setReady(true);
      const [profilesResult, entriesResult, commentsResult, scriptureResult] = await Promise.all([
        supabase.from("profiles").select("id, nickname, created_at"),
        supabase.from("qt_entries").select("id, author_id, entry_date, scripture, reflection, created_at, updated_at").order("entry_date"),
        supabase.from("qt_comments").select("id, entry_id, author_id, parent_comment_id, content, created_at").order("created_at"),
        supabase.from("daily_scriptures").select("scripture").eq("reading_date", today).maybeSingle(),
      ]);
      const loadedUsers: User[] = (profilesResult.data ?? []).map((item) => ({ id: item.id, name: item.nickname, createdAt: item.created_at }));
      const loadedEntries: Entry[] = (entriesResult.data ?? []).map((item) => ({ id: item.id, userId: item.author_id, date: item.entry_date, scripture: item.scripture, reflection: item.reflection, createdAt: item.created_at, updatedAt: item.updated_at }));
      const loadedComments: Comment[] = (commentsResult.data ?? []).map((item) => ({ id: item.id, entryId: item.entry_id, authorId: item.author_id, parentCommentId: item.parent_comment_id, content: item.content, createdAt: item.created_at }));
      setUsers(loadedUsers.length ? loadedUsers : [{ id: authenticatedUser.id, name: authenticatedUser.name, createdAt: new Date().toISOString() }]);
      setEntries(loadedEntries);
      setComments(loadedComments);
      setCurrentUserId(authenticatedUser.id);
      setDailyScripture(scriptureResult.data?.scripture ?? "");
      if (entriesResult.error || commentsResult.error || profilesResult.error || scriptureResult.error) {
        setToast("Supabase의 최신 migration을 먼저 실행해 주세요.");
        setScreen("dashboard");
      } else {
        const entry = loadedEntries.find((item) => item.userId === authenticatedUser.id && item.date === today);
        if (entry) {
          setSelectedDate(today);
          setScreen("dashboard");
        } else {
          setEditingDate(today);
          setScripture(scriptureResult.data?.scripture ?? "");
          setScreen("scripture");
        }
      }
      setReady(true);
    }
    void loadSharedData();
  }, [authenticatedUser.id, authenticatedUser.name, today]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (modalEntry) modalRef.current?.focus();
  }, [modalEntry]);

  const dailyEntries = useMemo(
    () => entries.filter((entry) => entry.date === selectedDate),
    [entries, selectedDate],
  );
  const completed = entries.filter((entry) => entry.date.startsWith(targetMonth)).length;

  function beginEntry(entry?: Entry) {
    setScripture(entry?.scripture ?? dailyScripture);
    setReflection(entry?.reflection ?? "");
    setEditingDate(entry?.date ?? today);
    setScriptureError("");
    setReflectionError("");
    setScreen("scripture");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submitScripture(event: FormEvent) {
    event.preventDefault();
    if (!scripture.trim()) return setScriptureError("읽은 성경 범위를 입력해 주세요.");
    setScripture(scripture.trim());
    setScriptureError("");
    setScreen("reflection");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitReflection(event: FormEvent) {
    event.preventDefault();
    if (reflection.length < CONFIG.minReflection || !reflection.replace(/\s/g, "")) {
      return setReflectionError(`묵상을 ${Math.max(0, CONFIG.minReflection - reflection.length)}자 더 작성해 주세요.`);
    }
    if (!currentUserId || !editingDate) {
      return setReflectionError("작성 날짜를 확인해 주세요.");
    }
    const previous = entries.find((entry) => entry.userId === currentUserId && entry.date === editingDate);
    const supabase = createClient();
    if (!supabase) return setReflectionError("Supabase 연결을 확인해 주세요.");
    const payload = { author_id: currentUserId, entry_date: editingDate, scripture: scripture.trim(), reflection };
    const result = previous
      ? await supabase.from("qt_entries").update(payload).eq("id", previous.id).select("id, author_id, entry_date, scripture, reflection, created_at, updated_at").single()
      : await supabase.from("qt_entries").insert(payload).select("id, author_id, entry_date, scripture, reflection, created_at, updated_at").single();
    if (result.error || !result.data) return setReflectionError("기록을 저장하지 못했습니다. migration과 연결 상태를 확인해 주세요.");
    const item = result.data;
    const saved: Entry = { id: item.id, userId: item.author_id, date: item.entry_date, scripture: item.scripture, reflection: item.reflection, createdAt: item.created_at, updatedAt: item.updated_at };
    setEntries((current) => previous ? current.map((entry) => entry.id === previous.id ? saved : entry) : [...current, saved]);
    setSelectedDate(editingDate);
    setEditingDate(null);
    setScreen("dashboard");
    setToast("오늘의 QT가 저장되었습니다.");
  }

  async function logout() {
    const supabase = createClient();
    await supabase?.auth.signOut();
    window.location.reload();
  }

  function openEntry(entry: Entry | undefined, date: string) {
    setSelectedDate(date);
    if (!entry) {
      setToast(date > today ? "미래 날짜에는 아직 기록할 수 없어요." : "작성된 묵상이 없습니다.");
      return;
    }
    setModalEntry(entry);
  }

  function closeEntry() {
    setModalEntry(null);
    setCommentText("");
    setReplyText("");
    setReplyingTo(null);
    setCommentError("");
  }

  async function submitComment(event: FormEvent) {
    event.preventDefault();
    if (!modalEntry || !currentUserId || !commentText.trim()) return;
    setSavingComment(true);
    setCommentError("");
    const supabase = createClient();
    const { data, error } = supabase ? await supabase.from("qt_comments").insert({ entry_id: modalEntry.id, author_id: currentUserId, content: commentText.trim() }).select("id, entry_id, author_id, parent_comment_id, content, created_at").single() : { data: null, error: new Error("Supabase is not configured") };
    setSavingComment(false);
    if (error || !data) return setCommentError("댓글을 저장하지 못했습니다.");
    setComments((current) => [...current, { id: data.id, entryId: data.entry_id, authorId: data.author_id, parentCommentId: data.parent_comment_id, content: data.content, createdAt: data.created_at }]);
    setCommentText("");
  }

  async function submitReply(event: FormEvent, parentCommentId: string) {
    event.preventDefault();
    if (!modalEntry || !currentUserId || modalEntry.userId !== currentUserId || !replyText.trim()) return;
    setSavingComment(true);
    setCommentError("");
    const supabase = createClient();
    const { data, error } = supabase ? await supabase.from("qt_comments").insert({ entry_id: modalEntry.id, author_id: currentUserId, parent_comment_id: parentCommentId, content: replyText.trim() }).select("id, entry_id, author_id, parent_comment_id, content, created_at").single() : { data: null, error: new Error("Supabase is not configured") };
    setSavingComment(false);
    if (error || !data) return setCommentError("답글을 저장하지 못했습니다.");
    setComments((current) => [...current, { id: data.id, entryId: data.entry_id, authorId: data.author_id, parentCommentId: data.parent_comment_id, content: data.content, createdAt: data.created_at }]);
    setReplyText("");
    setReplyingTo(null);
  }

  if (!ready) return <main className="app"><header className="brand"><span className="brand-mark">✦</span><span>Bible Hunter</span></header></main>;

  return (
    <main className="app">
      <header className="brand"><span className="brand-mark" aria-hidden="true">✦</span><span>Bible Hunter</span></header>

      {screen === "scripture" && (
        <section className="screen input-screen" aria-labelledby="scripture-title">
          <div className="step-label">TODAY&apos;S WORD</div>
          <h1 id="scripture-title">오늘 읽은<br />성경 말씀은?</h1>
          <form onSubmit={submitScripture} noValidate>
            {dailyScripture ? (
              <div className="daily-scripture-card">
                <span><small>오늘 · {formatDate(editingDate ?? today)}</small><strong>{dailyScripture}</strong></span>
                <button type="button" onClick={() => { setScripture(dailyScripture); setScriptureError(""); }} disabled={scripture === dailyScripture}>오늘 본문 적용</button>
              </div>
            ) : (
              <p className="daily-scripture-empty">오늘 등록된 본문이 없어 직접 입력해 주세요.</p>
            )}
            <label htmlFor="scripture-input">성경 범위</label>
            <input id="scripture-input" value={scripture} onChange={(e) => { setScripture(e.target.value); setScriptureError(""); }} maxLength={50} placeholder="예: 창세기 1장 1–10절" autoFocus={!dailyScripture} />
            <p className="field-help">오늘 본문이 자동으로 입력됩니다. 다른 범위를 읽었다면 직접 수정할 수 있어요.</p>
            <p className="field-error" aria-live="polite">{scriptureError}</p>
            <button className="primary-button" type="submit">다음 <span aria-hidden="true">→</span></button>
          </form>
        </section>
      )}

      {screen === "reflection" && (
        <section className="screen input-screen" aria-labelledby="reflection-title">
          <button className="back-button" type="button" onClick={() => setScreen("scripture")}>← <span>성경 범위 수정</span></button>
          <div className="step-label">MEDITATION</div>
          <h1 id="reflection-title">하나님과<br />나눈 묵상</h1>
          <p className="scripture-preview">{scripture}</p>
          <form onSubmit={submitReflection} noValidate>
            <label htmlFor="reflection-input">오늘의 묵상</label>
            <textarea id="reflection-input" value={reflection} onChange={(e) => { setReflection(e.target.value); setReflectionError(""); }} maxLength={100} rows={7} placeholder="말씀을 통해 받은 마음과 오늘의 다짐을 기록해 보세요." autoFocus />
            <div className="reflection-meta"><p className="field-error" aria-live="polite">{reflectionError || (reflection.length > 0 && reflection.length < CONFIG.minReflection ? `묵상을 ${CONFIG.minReflection - reflection.length}자 더 작성해 주세요.` : "")}</p><output>{reflection.length} / {CONFIG.maxReflection}자</output></div>
            <button className="primary-button" type="submit" disabled={reflection.length < CONFIG.minReflection || !reflection.replace(/\s/g, "")}>기록 완료 <span aria-hidden="true">→</span></button>
          </form>
        </section>
      )}

      {screen === "dashboard" && (
          <section className="screen dashboard-screen" aria-labelledby="dashboard-title">
          <div className="dashboard-header">
            <div><div className="step-label">{calendarYear}년 {calendarMonth}월</div><h1 id="dashboard-title">우리의 QT 여정</h1></div>
            <button className="user-button" type="button" onClick={logout}><span>{currentUser?.name}</span><small>로그아웃</small></button>
          </div>
          <div className="today-action">
            <button className="today-card" type="button" onClick={() => beginEntry(entries.find((entry) => entry.userId === currentUserId && entry.date === today))}>
              <span><small>TODAY · {formatDate(today)}</small><strong>{entries.some((entry) => entry.userId === currentUserId && entry.date === today) ? "오늘의 QT를 수정할까요?" : "오늘의 QT를 기록하세요"}</strong></span><span aria-hidden="true">{entries.some((entry) => entry.userId === currentUserId && entry.date === today) ? "수정 →" : "+"}</span>
            </button>
          </div>
          <section className="tracker-card" aria-labelledby="tracker-title">
            <div className="section-heading"><div><p className="eyebrow">FAMILY PROGRESS</p><h2 id="tracker-title">{calendarMonth}월 전체 현황</h2></div><p>{completed} QT 완료</p></div>
            <div className="tracker-scroll" tabIndex={0} aria-label={`구성원별 ${calendarMonth}월 QT 현황`}>
              <div className="tracker-grid" style={{ "--days": days.length } as React.CSSProperties}>
                <div className="tracker-cell tracker-corner">구성원</div>
                {days.map((day) => { const date = targetDate(day); return <button key={`day-${day}`} className={`tracker-cell tracker-day${date === today ? " is-today" : ""}${date === selectedDate ? " is-selected" : ""}`} type="button" onClick={() => setSelectedDate(date)}>{day}</button>; })}
                {users.map((user) => {
                  const userEntries = entries.filter((entry) => entry.userId === user.id && entry.date.startsWith(targetMonth));
                  return [
                    <div className="tracker-cell tracker-name" key={`${user.id}-name`}><strong title={user.name}>{user.name}</strong><small>{userEntries.length} / {days.length}일</small></div>,
                    ...days.map((day) => { const date = targetDate(day); const entry = userEntries.find((item) => item.date === date); return <button key={`${user.id}-${day}`} className={`tracker-cell tracker-status${entry ? " is-complete" : ""}${date > today ? " is-future" : ""}${date === today ? " is-today" : ""}${date === selectedDate ? " is-selected" : ""}`} type="button" onClick={() => openEntry(entry, date)} aria-label={`${user.name}, ${formatDate(date)}, ${entry ? "묵상 완료" : "기록 없음"}`}>{entry ? "✓" : "·"}</button>; }),
                  ];
                })}
              </div>
            </div>
          </section>
          <section className="comparison-card" aria-labelledby="comparison-title">
            <div className="section-heading"><div><p className="eyebrow">DAILY WORDS</p><h2 id="comparison-title">날짜별 말씀 비교</h2></div><label className="date-picker-label">날짜 <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>{days.map((day) => <option key={day} value={targetDate(day)}>{day}일</option>)}</select></label></div>
            <div className="comparison-list" aria-live="polite">
              <p className="comparison-date">{calendarYear}년 {formatDate(selectedDate)} · {dailyEntries.length}명 완료</p>
              {!dailyEntries.length ? <div className="empty-state">이 날짜에 작성된 QT가 없습니다.</div> : dailyEntries.map((entry) => { const user = users.find((item) => item.id === entry.userId); return <button className="comparison-item" type="button" key={entry.id} onClick={() => openEntry(entry, entry.date)}><span className="avatar">{(user?.name || "?").slice(0, 1)}</span><span><strong>{user?.name || "알 수 없음"}</strong><small>{entry.scripture}</small></span><span aria-hidden="true">→</span></button>; })}
            </div>
          </section>
        </section>
      )}

      <div className={`toast${toast ? " is-visible" : ""}`} role="status" aria-live="polite">{toast}</div>
      {modalEntry && (
        <div className="modal" role="presentation" onKeyDown={(e) => { if (e.key === "Escape") closeEntry(); }}>
          <button className="modal-backdrop" type="button" aria-label="묵상 상세 닫기" onClick={closeEntry} />
          <article className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1} ref={modalRef}>
            <button className="modal-close" type="button" onClick={closeEntry} aria-label="묵상 상세 닫기">×</button>
            <p className="eyebrow">{modalEntry.date.slice(0, 4)}년 {formatDate(modalEntry.date)}</p><h2 id="modal-title">{users.find((user) => user.id === modalEntry.userId)?.name || "구성원"}님의 묵상</h2>
            <dl><dt>읽은 성경</dt><dd>{modalEntry.scripture}</dd><dt>묵상</dt><dd className="modal-reflection">{modalEntry.reflection}</dd></dl>
            {modalEntry.userId === currentUserId && <button className="secondary-button" type="button" onClick={() => { const entry = modalEntry; closeEntry(); beginEntry(entry); }}>내 기록 수정</button>}
            <section className="comments" aria-labelledby="comments-title">
              <div className="comments-heading"><h3 id="comments-title">댓글</h3><span>{comments.filter((comment) => comment.entryId === modalEntry.id && !comment.parentCommentId).length}</span></div>
              <div className="comment-list">
                {comments.filter((comment) => comment.entryId === modalEntry.id && !comment.parentCommentId).map((comment) => {
                  const reply = comments.find((item) => item.parentCommentId === comment.id);
                  return (
                    <article className="comment-thread" key={comment.id}>
                      <div className="comment-item"><div className="comment-meta"><strong>{users.find((user) => user.id === comment.authorId)?.name || "구성원"}</strong><time dateTime={comment.createdAt}>{formatCommentTime(comment.createdAt)}</time></div><p>{comment.content}</p></div>
                      {reply && <div className="comment-item comment-reply"><div className="comment-meta"><strong>{users.find((user) => user.id === reply.authorId)?.name || "작성자"} · 작성자 답글</strong><time dateTime={reply.createdAt}>{formatCommentTime(reply.createdAt)}</time></div><p>{reply.content}</p></div>}
                      {modalEntry.userId === currentUserId && comment.authorId !== currentUserId && !reply && (replyingTo === comment.id ? (
                        <form className="reply-form" onSubmit={(event) => submitReply(event, comment.id)}><label htmlFor={`reply-${comment.id}`}>답글</label><textarea id={`reply-${comment.id}`} value={replyText} onChange={(e) => setReplyText(e.target.value)} maxLength={300} rows={2} autoFocus /><div className="comment-actions"><button type="button" onClick={() => { setReplyingTo(null); setReplyText(""); }}>취소</button><button type="submit" disabled={savingComment || !replyText.trim()}>답글 등록</button></div></form>
                      ) : <button className="reply-button" type="button" onClick={() => { setReplyingTo(comment.id); setReplyText(""); }}>답글 쓰기</button>)}
                    </article>
                  );
                })}
                {!comments.some((comment) => comment.entryId === modalEntry.id && !comment.parentCommentId) && <p className="comments-empty">아직 댓글이 없습니다.</p>}
              </div>
              <form className="comment-form" onSubmit={submitComment}><label htmlFor="comment-input">댓글 남기기</label><textarea id="comment-input" value={commentText} onChange={(e) => setCommentText(e.target.value)} maxLength={300} rows={3} placeholder="묵상에 덧붙이고 싶은 마음을 적어주세요." /><button type="submit" disabled={savingComment || !commentText.trim()}>댓글 등록</button></form>
              <p className="field-error" aria-live="polite">{commentError}</p>
            </section>
          </article>
        </div>
      )}
    </main>
  );
}
