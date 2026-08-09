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
      <div className="entry-card-heading">
        <h2>{entry.title}</h2>
        <time dateTime={entry.created_at}>{readableDate}</time>
      </div>
      <p>{entry.content}</p>
    </article>
  );
}
