import Link from "next/link";
import { deleteEntry } from "@/app/admin/actions";

export type Entry = {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  created_at: string;
};

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function EntryCard({
  entry,
  canDelete,
}: {
  entry: Entry;
  canDelete: boolean;
}) {
  const createdAt = new Date(entry.created_at);
  const readableDate = Number.isNaN(createdAt.getTime())
    ? "날짜 정보 없음"
    : dateFormatter.format(createdAt);

  return (
    <article className="entry-card">
      <div className="entry-author-row">
        <span className="entry-avatar" aria-hidden="true">
          {entry.author_name.trim().charAt(0) || "가"}
        </span>
        <div>
          <strong>{entry.author_name}</strong>
          <time dateTime={entry.created_at}>{readableDate}</time>
        </div>
      </div>

      <Link
        className="entry-card-link"
        href={`/entries/${entry.id}`}
        aria-label={`${entry.title} 전체 읽기`}
      >
        <h2>{entry.title}</h2>
        <p className="entry-card-preview">{entry.content}</p>
        <span className="read-more">자세히 읽기</span>
      </Link>

      {canDelete ? (
        <form action={deleteEntry} className="entry-delete-form">
          <input type="hidden" name="entryId" value={entry.id} />
          <button className="delete-button" type="submit">
            삭제
          </button>
        </form>
      ) : null}
    </article>
  );
}
