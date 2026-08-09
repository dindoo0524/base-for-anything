export default function Loading() {
  return (
    <main className="site-shell public-shell" aria-busy="true">
      <header className="hero">
        <p className="eyebrow">우리 가족 말씀편지</p>
        <h1>말씀편지를 펼치고 있습니다</h1>
        <p className="hero-copy">잠시만 기다려 주세요.</p>
      </header>
      <div className="loading-card" />
      <div className="loading-card" />
    </main>
  );
}
