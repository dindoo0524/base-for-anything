"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

const CONFIG = {
  year: 2026,
  month: 8,
  minReflection: 50,
  maxReflection: 100,
  keys: {
    users: "bible-hunter-v3-users",
    entries: "bible-hunter-v3-entries",
    session: "bible-hunter-v3-session",
  },
} as const;

type Screen = "name" | "scripture" | "reflection" | "dashboard";
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

const pad = (value: number) => String(value).padStart(2, "0");
const targetDate = (day: number) => `${CONFIG.year}-${pad(CONFIG.month)}-${pad(day)}`;
const days = Array.from({ length: new Date(CONFIG.year, CONFIG.month, 0).getDate() }, (_, i) => i + 1);
const localDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};
const formatDate = (value: string) => {
  const [, month, day] = value.split("-");
  return `${Number(month)}월 ${Number(day)}일`;
};
const newId = (prefix: string) =>
  `${prefix}_${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(36).slice(2)}`}`;

function readArray<T>(key: string): T[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function BibleHunter() {
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>("name");
  const [users, setUsers] = useState<User[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [scripture, setScripture] = useState("");
  const [reflection, setReflection] = useState("");
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(targetDate(1));
  const [nameError, setNameError] = useState("");
  const [scriptureError, setScriptureError] = useState("");
  const [reflectionError, setReflectionError] = useState("");
  const [modalEntry, setModalEntry] = useState<Entry | null>(null);
  const [toast, setToast] = useState("");
  const modalRef = useRef<HTMLElement>(null);

  const today = localDate();
  const targetMonth = `${CONFIG.year}-${pad(CONFIG.month)}-`;
  const todayInTargetMonth = today.startsWith(targetMonth);
  const currentUser = users.find((user) => user.id === currentUserId);

  useEffect(() => {
    /* Client-only localStorage hydration intentionally initializes the app after mount. */
    /* eslint-disable react-hooks/set-state-in-effect */
    const storedUsers = readArray<User>(CONFIG.keys.users);
    const storedEntries = readArray<Entry>(CONFIG.keys.entries);
    setUsers(storedUsers);
    setEntries(storedEntries);
    try {
      const session = JSON.parse(localStorage.getItem(CONFIG.keys.session) || "null");
      const user = storedUsers.find((item) => item.id === session?.userId);
      if (user) {
        setCurrentUserId(user.id);
        if (todayInTargetMonth) {
          const entry = storedEntries.find((item) => item.userId === user.id && item.date === today);
          if (entry) {
            setSelectedDate(today);
            setScreen("dashboard");
          } else {
            setEditingDate(today);
            setScreen("scripture");
          }
        } else {
          setScreen("dashboard");
        }
      }
    } catch {
      localStorage.removeItem(CONFIG.keys.session);
    }
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [today, todayInTargetMonth]);

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
    setScripture(entry?.scripture ?? "");
    setReflection(entry?.reflection ?? "");
    setEditingDate(entry?.date ?? (todayInTargetMonth ? today : null));
    setScriptureError("");
    setReflectionError("");
    setScreen("scripture");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submitName(event: FormEvent) {
    event.preventDefault();
    const normalized = name.trim().replace(/\s+/g, " ");
    if (!normalized) return setNameError("이름 또는 별명을 입력해 주세요.");
    let user = users.find((item) => item.name.toLocaleLowerCase("ko-KR") === normalized.toLocaleLowerCase("ko-KR"));
    let nextUsers = users;
    if (!user) {
      user = { id: newId("user"), name: normalized, createdAt: new Date().toISOString() };
      nextUsers = [...users, user];
    }
    if (!write(CONFIG.keys.users, nextUsers) || !write(CONFIG.keys.session, { userId: user.id })) {
      return setNameError("저장 공간을 사용할 수 없습니다.");
    }
    setUsers(nextUsers);
    setCurrentUserId(user.id);
    setNameError("");
    const entry = todayInTargetMonth
      ? entries.find((item) => item.userId === user.id && item.date === today)
      : undefined;
    if (todayInTargetMonth && !entry) beginEntry();
    else {
      setSelectedDate(todayInTargetMonth ? today : targetDate(1));
      setScreen("dashboard");
    }
  }

  function submitScripture(event: FormEvent) {
    event.preventDefault();
    if (!scripture.trim()) return setScriptureError("읽은 성경 범위를 입력해 주세요.");
    setScripture(scripture.trim());
    setScriptureError("");
    setScreen("reflection");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submitReflection(event: FormEvent) {
    event.preventDefault();
    if (reflection.length < CONFIG.minReflection || !reflection.replace(/\s/g, "")) {
      return setReflectionError(`묵상을 ${Math.max(0, CONFIG.minReflection - reflection.length)}자 더 작성해 주세요.`);
    }
    if (!currentUserId || !editingDate) {
      return setReflectionError(`${CONFIG.year}년 ${CONFIG.month}월에만 새 기록을 작성할 수 있습니다.`);
    }
    const previous = entries.find((entry) => entry.userId === currentUserId && entry.date === editingDate);
    const now = new Date().toISOString();
    const saved: Entry = {
      id: previous?.id ?? newId("entry"),
      userId: currentUserId,
      date: editingDate,
      scripture: scripture.trim(),
      reflection,
      createdAt: previous?.createdAt ?? now,
      updatedAt: now,
    };
    const nextEntries = previous
      ? entries.map((entry) => (entry.id === previous.id ? saved : entry))
      : [...entries, saved];
    if (!write(CONFIG.keys.entries, nextEntries)) return setReflectionError("기록을 저장하지 못했습니다.");
    setEntries(nextEntries);
    setSelectedDate(editingDate);
    setEditingDate(null);
    setScreen("dashboard");
    setToast("오늘의 QT가 저장되었습니다.");
  }

  function changeUser() {
    localStorage.removeItem(CONFIG.keys.session);
    setCurrentUserId(null);
    setName("");
    setScreen("name");
  }

  function openEntry(entry: Entry | undefined, date: string) {
    setSelectedDate(date);
    if (!entry) {
      setToast(date > today ? "미래 날짜에는 아직 기록할 수 없어요." : "작성된 묵상이 없습니다.");
      return;
    }
    setModalEntry(entry);
  }

  if (!ready) return <main className="app"><header className="brand"><span className="brand-mark">✦</span><span>Bible Hunter</span></header></main>;

  return (
    <main className="app">
      <header className="brand"><span className="brand-mark" aria-hidden="true">✦</span><span>Bible Hunter</span></header>

      {screen === "name" && (
        <section className="screen input-screen" aria-labelledby="name-title">
          <div className="step-label">WELCOME, HUNTER</div>
          <h1 id="name-title">이름 또는 별명을<br />적어주세요</h1>
          <p className="lead">처음 한 번만 입력하면 다음부터 바로 오늘의 성경 기록을 시작할 수 있어요.</p>
          <form onSubmit={submitName} noValidate>
            <label htmlFor="name-input">이름 또는 별명</label>
            <input id="name-input" value={name} onChange={(e) => setName(e.target.value)} maxLength={20} autoComplete="name" placeholder="예: 다윗" autoFocus />
            <p className="field-error" aria-live="polite">{nameError}</p>
            <button className="primary-button" type="submit">시작하기 <span aria-hidden="true">→</span></button>
          </form>
        </section>
      )}

      {screen === "scripture" && (
        <section className="screen input-screen" aria-labelledby="scripture-title">
          <div className="step-label">TODAY&apos;S WORD</div>
          <h1 id="scripture-title">오늘 읽은<br />성경 말씀은?</h1>
          <form onSubmit={submitScripture} noValidate>
            <label htmlFor="scripture-input">성경 범위</label>
            <input id="scripture-input" value={scripture} onChange={(e) => setScripture(e.target.value)} maxLength={50} placeholder="예: 창세기 1장 1–10절" autoFocus />
            <p className="field-help">책, 장, 절을 자유롭게 적어주세요.</p>
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
            <div><div className="step-label">AUGUST 2026</div><h1 id="dashboard-title">우리의 QT 여정</h1></div>
            <button className="user-button" type="button" onClick={changeUser}><span>{currentUser?.name}</span><small>사용자 변경</small></button>
          </div>
          <div className="today-action">
            {todayInTargetMonth ? (
              <button className="today-card" type="button" onClick={() => beginEntry(entries.find((entry) => entry.userId === currentUserId && entry.date === today))}>
                <span><small>TODAY · {formatDate(today)}</small><strong>{entries.some((entry) => entry.userId === currentUserId && entry.date === today) ? "오늘의 QT를 수정할까요?" : "오늘의 QT를 기록하세요"}</strong></span><span aria-hidden="true">{entries.some((entry) => entry.userId === currentUserId && entry.date === today) ? "수정 →" : "+"}</span>
              </button>
            ) : <p className="notice">기록 기간은 {CONFIG.year}년 {CONFIG.month}월입니다. 지난 기록은 조회할 수 있어요.</p>}
          </div>
          <section className="tracker-card" aria-labelledby="tracker-title">
            <div className="section-heading"><div><p className="eyebrow">FAMILY PROGRESS</p><h2 id="tracker-title">8월 전체 현황</h2></div><p>{completed} QT 완료</p></div>
            <div className="tracker-scroll" tabIndex={0} aria-label="구성원별 8월 QT 현황">
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
              <p className="comparison-date">{CONFIG.year}년 {formatDate(selectedDate)} · {dailyEntries.length}명 완료</p>
              {!dailyEntries.length ? <div className="empty-state">이 날짜에 작성된 QT가 없습니다.</div> : dailyEntries.map((entry) => { const user = users.find((item) => item.id === entry.userId); return <button className="comparison-item" type="button" key={entry.id} onClick={() => openEntry(entry, entry.date)}><span className="avatar">{(user?.name || "?").slice(0, 1)}</span><span><strong>{user?.name || "알 수 없음"}</strong><small>{entry.scripture}</small></span><span aria-hidden="true">→</span></button>; })}
            </div>
          </section>
        </section>
      )}

      <div className={`toast${toast ? " is-visible" : ""}`} role="status" aria-live="polite">{toast}</div>
      {modalEntry && (
        <div className="modal" role="presentation" onKeyDown={(e) => { if (e.key === "Escape") setModalEntry(null); }}>
          <button className="modal-backdrop" type="button" aria-label="묵상 상세 닫기" onClick={() => setModalEntry(null)} />
          <article className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1} ref={modalRef}>
            <button className="modal-close" type="button" onClick={() => setModalEntry(null)} aria-label="묵상 상세 닫기">×</button>
            <p className="eyebrow">{CONFIG.year}년 {formatDate(modalEntry.date)}</p><h2 id="modal-title">{users.find((user) => user.id === modalEntry.userId)?.name || "구성원"}님의 묵상</h2>
            <dl><dt>읽은 성경</dt><dd>{modalEntry.scripture}</dd><dt>묵상</dt><dd className="modal-reflection">{modalEntry.reflection}</dd></dl>
            {modalEntry.userId === currentUserId && <button className="secondary-button" type="button" onClick={() => { const entry = modalEntry; setModalEntry(null); beginEntry(entry); }}>내 기록 수정</button>}
          </article>
        </div>
      )}
    </main>
  );
}
