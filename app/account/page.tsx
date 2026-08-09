import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/admin/actions";
import { FamilyNav } from "@/components/family-nav";
import { SetupNotice } from "@/components/setup-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { getFamilyMember } from "@/lib/family";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="site-shell narrow-shell">
        <Link className="back-link" href="/">소개 화면으로 돌아가기</Link>
        <SetupNotice />
      </main>
    );
  }

  const { member, profileError } = await getFamilyMember();

  if (!member) redirect("/login");

  return (
    <main className="app-shell account-shell">
      <FamilyNav
        active="account"
        displayName={member.displayName}
        role={member.role}
      />

      <section className="account-card">
        <span className="account-avatar" aria-hidden="true">
          {member.displayName.trim().charAt(0) || "가"}
        </span>
        <p className="eyebrow">My account</p>
        <h1>{member.displayName}</h1>
        <p className="account-email">{member.email}</p>
        <span className="role-badge">
          {member.role === "admin" ? "Admin · 최고 권한" : "Family · 가족 회원"}
        </span>

        <div className="permission-list">
          <p><span aria-hidden="true">✓</span> 가족 글 전체 읽기</p>
          <p><span aria-hidden="true">✓</span> 새 가족 글 작성</p>
          <p>
            <span aria-hidden="true">✓</span>
            {member.role === "admin" ? "모든 가족 글 삭제" : "내가 작성한 글 삭제"}
          </p>
        </div>

        {profileError ? (
          <p className="form-message form-error">
            v2.0 migration을 실행하면 역할 정보가 정확히 표시됩니다.
          </p>
        ) : null}

        <form action={logout}>
          <button className="account-logout" type="submit">로그아웃</button>
        </form>
      </section>
    </main>
  );
}
