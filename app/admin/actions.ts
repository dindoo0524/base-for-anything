"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const TITLE_MAX_LENGTH = 120;
const CONTENT_MAX_LENGTH = 5000;

export type EntryActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function createEntry(
  _previousState: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!title || !content) {
    return { status: "error", message: "제목과 내용을 모두 입력해 주세요." };
  }

  if (title.length > TITLE_MAX_LENGTH) {
    return {
      status: "error",
      message: `제목은 ${TITLE_MAX_LENGTH}자 이하로 입력해 주세요.`,
    };
  }

  if (content.length > CONTENT_MAX_LENGTH) {
    return {
      status: "error",
      message: `내용은 ${CONTENT_MAX_LENGTH}자 이하로 입력해 주세요.`,
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return { status: "error", message: "Supabase 연결이 필요합니다." };
  }

  const { data: claimsData, error: authError } = await supabase.auth.getClaims();
  const authorId = claimsData?.claims?.sub;

  if (authError || typeof authorId !== "string") {
    return { status: "error", message: "로그인 상태를 다시 확인해 주세요." };
  }

  const { error } = await supabase.from("entries").insert({
    title,
    content,
    author_id: authorId,
  });

  if (error) {
    return {
      status: "error",
      message: "저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  revalidatePath("/");

  return { status: "success", message: "저장했습니다. 공개 화면에 바로 표시됩니다." };
}

export async function logout() {
  const supabase = await createClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/login");
}
