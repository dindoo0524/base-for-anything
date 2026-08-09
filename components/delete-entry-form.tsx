"use client";

import { deleteEntry } from "@/app/admin/actions";

type DeleteEntryFormProps = {
  entryId: string;
  detail?: boolean;
};

export function DeleteEntryForm({
  entryId,
  detail = false,
}: DeleteEntryFormProps) {
  return (
    <form
      action={deleteEntry}
      className={detail ? "detail-delete-form" : "entry-delete-form"}
      onSubmit={(event) => {
        if (!window.confirm("이 글을 정말 삭제할까요?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="entryId" value={entryId} />
      <button className="delete-button" type="submit">
        {detail ? "이 글 삭제" : "삭제"}
      </button>
    </form>
  );
}
