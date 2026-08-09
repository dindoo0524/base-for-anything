import Link from "next/link";

export type Entry = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function EntryCard({ entry }: { entry: Entry }) {
  const createdAt = new Date(entry.created_at);
  const readableDate = Number.isNaN(createdAt.getTime())
    ? "날짜 정보 없음"
    : dateFormatter.format(createdAt);

  return (
    <article className="entry-card">
      <Link
        className="entry-card-link"
        href={`/entries/${entry.id}`}
        aria-label={`${entry.title} 전체 읽기`}
      >
        <div className="entry-card-heading">
          <h2>{entry.title}</h2>
          <time dateTime={entry.created_at}>{readableDate}</time>
        </div>
        <p className="entry-card-preview">{entry.content}</p>
        <span className="read-more">편지 이어서 읽기</span>
      </Link>
    </article>
  );
}
