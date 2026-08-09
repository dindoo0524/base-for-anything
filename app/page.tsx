import Link from "next/link";

export default function Home() {
  return (
    <main className="landing-shell">
      <nav className="landing-nav" aria-label="공개 메뉴">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">우</span>
          <span>우리 가족 말씀편지</span>
        </Link>
        <Link className="nav-login" href="/login">가족 로그인</Link>
      </nav>

      <section className="landing-hero">
        <div className="landing-copy">
          <p className="eyebrow">A private place for our family</p>
          <h1>말씀과 마음으로<br />이어지는 우리 가족</h1>
          <p>
            오늘 묵상한 말씀과 서로에게 전하고 싶은 이야기를 한곳에
            차곡차곡 모읍니다. 가족 계정으로 로그인해 함께 읽고 써보세요.
          </p>
          <div className="landing-actions">
            <Link className="primary-link" href="/login">가족 공간 들어가기</Link>
            <a className="text-link" href="#about">어떤 공간인가요?</a>
          </div>
        </div>

        <div className="phone-preview" aria-label="가족 게시판 화면 미리보기">
          <div className="phone-speaker" aria-hidden="true" />
          <div className="preview-header">
            <span className="preview-avatar">민</span>
            <div>
              <small>좋은 아침이에요</small>
              <strong>우리 가족의 오늘</strong>
            </div>
          </div>
          <article className="preview-card">
            <div className="preview-meta">
              <span className="preview-avatar small">민</span>
              <span>가족 관리자</span>
              <small>오늘</small>
            </div>
            <h2>오늘 마음에 남은 말씀</h2>
            <p>염려를 내려놓고 감사할 일을 하나씩 발견하는 하루가 되면 좋겠습니다.</p>
            <span className="preview-pill">자세히 읽기</span>
          </article>
          <article className="preview-card muted-card" aria-hidden="true">
            <div className="preview-line short" />
            <div className="preview-line" />
            <div className="preview-line medium" />
          </article>
          <div className="preview-bottom" aria-hidden="true">
            <span />
            <span className="active" />
            <span />
          </div>
        </div>
      </section>

      <section className="landing-features" id="about">
        <article>
          <span>01</span>
          <h2>가족만 읽는 공간</h2>
          <p>상세 게시판은 로그인한 가족에게만 열립니다.</p>
        </article>
        <article>
          <span>02</span>
          <h2>누구나 함께 작성</h2>
          <p>관리자뿐 아니라 가족들도 자신의 이야기를 남깁니다.</p>
        </article>
        <article>
          <span>03</span>
          <h2>역할에 맞는 관리</h2>
          <p>가족은 자기 글을, 최고 관리자는 모든 글을 정리할 수 있습니다.</p>
        </article>
      </section>

      <footer className="landing-footer">
        <p>우리 가족 말씀편지 · 가족을 위한 비공개 기록 공간</p>
      </footer>
    </main>
  );
}
