# 오늘의 주문

- 주문 제목: 공유 묵상 댓글과 작성자 답글
- 날짜: 2026-08-11
- 작업 상태: 완료

## 오늘 만들 기능

모든 사용자의 QT 묵상을 Supabase에서 공유하고, 다른 사용자의 묵상에는 댓글을, 본인 묵상에 달린 댓글에는 한 단계 답글을 작성할 수 있게 합니다.

## 수정할 화면

- Bible Hunter 날짜별 묵상 목록
- 묵상 상세 화면

## 구체적인 요청

- QT 묵상을 Supabase에 저장하고 로그인한 사용자가 함께 조회합니다.
- 다른 사용자의 묵상 상세 아래에 댓글 목록과 입력창을 표시합니다.
- 로그인한 사용자만 다른 사용자의 묵상에 댓글을 작성할 수 있습니다.
- 댓글에 작성자 별명과 작성 시각을 표시합니다.
- 묵상 작성자는 본인 묵상에 달린 댓글마다 한 단계 답글을 작성할 수 있습니다.
- 답글에 다시 답글을 작성할 수는 없습니다.
- 관련 테이블과 RLS 정책을 migration으로 제공합니다.

## 이번에는 하지 않을 작업

- 댓글과 답글 수정·삭제
- 답글에 대한 추가 답글
- 댓글 알림
- 관리자 댓글 관리

## 완료 조건

- 여러 사용자가 Supabase에 저장된 QT 묵상을 함께 조회할 수 있습니다.
- 다른 사용자의 묵상에 댓글을 작성하고 다시 조회할 수 있습니다.
- 묵상 작성자는 댓글에 한 단계 답글을 작성하고 다시 조회할 수 있습니다.
- 권한이 없는 사용자는 댓글 또는 답글을 임의로 작성할 수 없습니다.
- 기존 QT 작성과 조회 흐름이 유지됩니다.
- lint와 build가 통과합니다.

## Codex 작업 결과

- Bible Hunter의 QT 묵상 저장소를 브라우저 localStorage에서 Supabase `qt_entries`로 전환했습니다.
- 로그인한 사용자가 모든 구성원의 QT 묵상을 함께 조회하도록 연결했습니다.
- 다른 사용자의 묵상 상세에서 댓글을 작성하고 작성자 별명과 작성 시각을 확인할 수 있습니다.
- 묵상 작성자는 본인 묵상에 달린 댓글마다 한 단계 답글을 한 번 작성할 수 있습니다.
- RLS에서 다른 사람의 묵상에만 일반 댓글을 허용하고, 묵상 작성자만 최상위 댓글에 답글을 달 수 있도록 제한했습니다.
- 기존 일반 게시물용 `entries` 테이블은 유지하고 Bible Hunter 전용 테이블을 별도로 추가했습니다.

## 변경한 파일

- `PROJECT_BRIEF.md`
- `components/bible-hunter.tsx`
- `app/globals.css`
- `supabase/migrations/003_create_qt_entries_comments.sql`
- `supabase/migrations/004_backfill_missing_profiles.sql`
- `README.md`
- `orders/2026-08-11-04-shared-comments-replies.md`

## 실행 및 검증 결과

- `npm.cmd run lint`: 통과
- `npm.cmd run build`: 통과
- Next.js 컴파일과 TypeScript 검사: 통과

## 남아 있는 문제

- Supabase Dashboard의 SQL Editor에서 `supabase/migrations/003_create_qt_entries_comments.sql`을 실행해야 실제 테이블과 RLS 정책이 생성됩니다.
- migration 실행 전 브라우저에만 저장되어 있던 기존 QT 기록은 자동 이전되지 않습니다.
- 실제 두 계정 간 댓글·답글 동작은 migration 실행 후 연결된 Supabase 프로젝트에서 확인해야 합니다.

## 오류 보완

- 프로필 트리거 생성 전에 가입한 계정에서 `qt_entries_author_id_fkey` 오류가 발생하는 문제를 확인했습니다.
- 기존 Auth 사용자의 누락된 프로필을 채우는 `004_backfill_missing_profiles.sql`을 추가했습니다.
- 로그인한 사용자에게 프로필이 없으면 앱에서도 본인 프로필을 자동 생성하도록 보완했습니다.
