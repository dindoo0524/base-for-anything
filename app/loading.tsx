export default function Loading() {
  return (
    <main className="site-shell public-shell" aria-busy="true">
      <header className="hero">
        <p className="eyebrow">Base for Anything</p>
        <h1>내용을 불러오고 있습니다</h1>
        <p className="hero-copy">잠시만 기다려 주세요.</p>
      </header>
      <div className="loading-card" />
      <div className="loading-card" />
    </main>
  );
}
