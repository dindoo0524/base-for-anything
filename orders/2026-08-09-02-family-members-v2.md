# 오늘의 주문서

- 주문 제목: 가족 회원과 관리자 권한을 갖춘 v2.0 만들기
- 날짜: 2026-08-09
- 작업 상태: 완료

## 오늘 만들 기능

외부 방문자에게는 프로젝트 소개만 보여주고, 로그인한 가족이 함께 글을 읽고 쓸 수 있는 가족 전용 게시판을 만듭니다.

## 작업하는 이유

관리자 혼자 글을 올리는 공간에서 한 단계 발전하여 가족들도 직접 묵상과 편지를 남기고, 서로의 글을 안전하게 읽는 경험을 만들기 위해서입니다.

## 사용자와 권한

- 최고 관리자 `Admin`: 가족 글 전체 읽기·쓰기, 모든 글 삭제
- 가족 `Member`: 가족 글 전체 읽기·쓰기, 자신이 작성한 글만 삭제
- 외부 방문자: 프로젝트 소개 화면만 조회

## 수정할 화면

- `/`: 외부 공개용 프로젝트 소개와 가족 로그인 안내
- `/login`: 관리자와 가족 공용 로그인
- `/family`: 로그인한 가족만 보는 전체 글 목록
- `/entries/[id]`: 로그인한 가족만 보는 상세 글
- `/admin`: 로그인한 가족의 새 글 작성 화면
- `/account`: 가족 이름, 역할, 권한, 로그아웃

## 구체적인 요청

- 가족별 계정 역할을 `Admin`과 `Member`로 구분합니다.
- 글 목록과 상세 화면에 작성자 이름을 보여줍니다.
- 가족은 자신의 글에만 삭제 버튼이 보이고 실제로 자기 글만 삭제할 수 있어야 합니다.
- 최고 관리자는 모든 글에 삭제 버튼이 보이고 실제로 모두 삭제할 수 있어야 합니다.
- 로그아웃한 사용자가 가족 게시판 주소를 열면 로그인 화면으로 이동해야 합니다.
- 기존 제목·본문·작성 날짜 중심의 단순한 글쓰기 흐름은 유지합니다.

## 디자인 레퍼런스

- 사용자가 첨부한 모바일 앱 화면을 참고합니다.
- 밝은 흰색 화면, 연한 회색 배경, 둥근 카드, 보라색 포인트 버튼을 사용합니다.
- 작은 프로필 표시와 모바일 하단 내비게이션으로 가족 앱 같은 인상을 만듭니다.
- 레퍼런스의 사진과 콘텐츠를 복제하지 않고 레이아웃과 시각 언어만 참고합니다.
- 수업에서는 Google 이미지에서 `app design reference`를 검색하고 원하는 이미지 1~3장을 Codex 채팅에 첨부합니다.

## 이번에는 하지 않을 작업

- 외부 공개 글과 가족 공개 글을 글마다 선택하는 기능
- 공개 회원가입과 초대 메일
- 사진·파일 업로드
- 댓글·반응·알림
- 글 수정

## 완료 조건

- 외부 방문자는 소개 화면만 볼 수 있습니다.
- 로그인한 가족은 가족 글 전체를 읽고 새 글을 작성할 수 있습니다.
- Member는 자기 글만, Admin은 모든 글을 삭제할 수 있습니다.
- Supabase RLS가 화면과 같은 권한을 강제합니다.
- 첨부한 앱 레퍼런스를 반영한 모바일 화면이 완성됩니다.
- lint와 build가 성공합니다.

## 작업 후 사용자가 확인할 내용

- Supabase SQL Editor에서 v2.0 migration을 실행합니다.
- 최고 관리자 프로필을 `admin`으로 지정하고 가족 계정을 만듭니다.
- 로그아웃, Member, Admin 계정으로 각각 읽기·쓰기·삭제 권한을 확인합니다.
- 모바일 너비에서 목록, 상세, 글쓰기, 하단 내비게이션을 확인합니다.

## Codex 작업 결과

외부 공개 소개 화면과 로그인한 가족만 사용하는 게시판을 분리했습니다. `profiles` 테이블의 `admin`·`member` 역할과 entries RLS를 추가했고, 가족은 자기 글만 삭제하고 관리자는 모든 글을 삭제하도록 구현했습니다. 첨부한 디자인 레퍼런스를 바탕으로 밝은 배경, 보라색 포인트, 둥근 카드, 프로필, 모바일 하단 메뉴를 적용했습니다. iPhone 안전영역과 320px 작은 화면, 입력창 확대 방지, 터치 영역도 보정했습니다.

## 변경한 파일

- `PROJECT_BRIEF.md`
- `README.md`
- `worksheets/project-start.md`
- `supabase/migrations/002_family_members_and_roles.sql`
- `app/page.tsx`
- `app/family/page.tsx`
- `app/entries/[id]/page.tsx`
- `app/admin/page.tsx`
- `app/admin/actions.ts`
- `app/account/page.tsx`
- `app/login/page.tsx`
- `app/login/actions.ts`
- `app/layout.tsx`
- `app/loading.tsx`
- `app/globals.css`
- `components/family-nav.tsx`
- `components/entry-card.tsx`
- `components/entry-form.tsx`
- `lib/family.ts`
- `lib/supabase/proxy.ts`
- `package.json`
- `package-lock.json`
- `orders/2026-08-09-02-family-members-v2.md`

## 실행 및 검증 결과

- `git diff --check`: 통과
- `npm run lint`: 통과
- `npm run build`: 통과
- 빌드 경로: `/`, `/login`, `/family`, `/entries/[id]`, `/admin`, `/account`

## 남아 있는 문제

Supabase SQL Editor에서 `002_family_members_and_roles.sql`을 실행하고 최고 관리자 계정을 `admin`으로 지정해야 합니다. 실제 Admin·Member 계정별 읽기·쓰기·삭제 확인은 migration 적용 후 사용자가 브라우저에서 진행합니다.
