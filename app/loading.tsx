export default function Loading() {
  return (
    <main className="site-shell" aria-busy="true">
      <header className="hero">
        <p className="eyebrow">Family board</p>
        <h1>가족 이야기를 불러오고 있어요</h1>
        <p className="hero-copy">잠시만 기다려 주세요.</p>
      </header>
      <div className="loading-card" />
      <div className="loading-card" />
    </main>
  );
}
