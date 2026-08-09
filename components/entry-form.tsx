"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  createEntry,
  type EntryActionState,
} from "@/app/admin/actions";

const initialState: EntryActionState = {
  status: "idle",
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="primary-button" type="submit" disabled={pending}>
      {pending ? "등록하는 중…" : "가족에게 공유하기"}
    </button>
  );
}

export function EntryForm() {
  const [state, formAction] = useActionState(createEntry, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="form-stack">
      <label htmlFor="title">제목</label>
      <input
        id="title"
        name="title"
        type="text"
        maxLength={120}
        required
        placeholder="예: 오늘 마음에 남은 말씀"
      />

      <label htmlFor="content">가족에게 전할 내용</label>
      <textarea
        id="content"
        name="content"
        rows={8}
        maxLength={5000}
        required
        placeholder="묵상한 내용이나 가족에게 전하고 싶은 마음을 편하게 적어보세요."
      />

      {state.message ? (
        <p
          className={`form-message ${
            state.status === "success" ? "form-success" : "form-error"
          }`}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
