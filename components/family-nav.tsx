import Link from "next/link";
import { logout } from "@/app/admin/actions";

type FamilyNavProps = {
  active: "family" | "write" | "account";
  displayName: string;
  role: "admin" | "member";
};

const navItems = [
  { href: "/family", label: "가족글", key: "family" },
  { href: "/admin", label: "글쓰기", key: "write" },
  { href: "/account", label: "내 정보", key: "account" },
] as const;

export function FamilyNav({ active, displayName, role }: FamilyNavProps) {
  const initial = displayName.trim().charAt(0) || "가";

  return (
    <>
      <header className="app-topbar">
        <Link className="brand" href="/family" aria-label="우리 가족 말씀편지 홈">
          <span className="brand-mark" aria-hidden="true">우</span>
          <span>우리 가족 말씀편지</span>
        </Link>

        <div className="member-menu">
          <span className="member-avatar" aria-hidden="true">{initial}</span>
          <span className="member-copy">
            <strong>{displayName}</strong>
            <small>{role === "admin" ? "Admin · 관리자" : "Family · 가족"}</small>
          </span>
          <form action={logout}>
            <button className="logout-button" type="submit">로그아웃</button>
          </form>
        </div>
      </header>

      <nav className="bottom-nav" aria-label="가족 게시판 메뉴">
        <Link className="bottom-nav-item" href="/">
          <span className="nav-icon nav-icon-home" aria-hidden="true" />
          <span>소개</span>
        </Link>
        {navItems.map((item) => (
          <Link
            className={`bottom-nav-item ${active === item.key ? "is-active" : ""}`}
            href={item.href}
            key={item.key}
            aria-current={active === item.key ? "page" : undefined}
          >
            <span className={`nav-icon nav-icon-${item.key}`} aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
