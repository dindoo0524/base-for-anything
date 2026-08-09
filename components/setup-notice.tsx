type SetupNoticeProps = {
  compact?: boolean;
};

export function SetupNotice({ compact = false }: SetupNoticeProps) {
  return (
    <section className={`notice notice-setup${compact ? " notice-compact" : ""}`}>
      <p className="eyebrow">설정 대기</p>
      <h2>Supabase 연결이 필요합니다</h2>
      <p>
        아직 데이터베이스 환경변수가 설정되지 않았습니다. README의 Supabase
        연결 순서를 완료하면 저장된 내용이 이곳에 표시됩니다.
      </p>
    </section>
  );
}
