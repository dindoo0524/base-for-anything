# 우리 가족 말씀편지 v2.0

가족이 로그인해 묵상과 편지를 함께 읽고 쓰는 비공개 가족 게시판입니다. 외부 방문자에게는 프로젝트 소개 화면만 보입니다.

## 역할과 권한

| 사용자 | 가족 글 읽기 | 글쓰기 | 삭제 |
| --- | --- | --- | --- |
| 최고 관리자 `Admin` | 전체 | 가능 | 모든 글 |
| 가족 `Member` | 전체 | 가능 | 자기 글만 |
| 외부 방문자 | 불가 | 불가 | 불가 |

공개 회원가입 화면은 제공하지 않습니다. 가족 계정은 Supabase Dashboard에서 직접 만듭니다.

## 1. 첫 실행

```bash
npm install
npm run dev
```

터미널에 표시된 로컬 주소를 브라우저에서 엽니다. 개발 서버는 `Control + C`로 멈춥니다.

## 2. Supabase 데이터베이스 준비

1. [Supabase Dashboard](https://supabase.com/dashboard)에서 새 프로젝트를 만듭니다.
2. 프로젝트가 준비될 때까지 기다립니다.
3. 왼쪽 메뉴의 **SQL Editor**를 엽니다.
4. `supabase/migrations/001_create_entries.sql` 파일의 전체 내용을 붙여넣고 실행합니다.
5. `supabase/migrations/002_create_profiles.sql` 파일의 전체 내용을 붙여넣고 실행합니다.
6. `supabase/migrations/003_create_qt_entries_comments.sql` 파일의 전체 내용을 붙여넣고 실행합니다.
7. 기존 가입 계정이 있다면 `supabase/migrations/004_backfill_missing_profiles.sql` 파일도 실행합니다.
8. `supabase/migrations/005_create_daily_scriptures.sql` 파일의 전체 내용을 붙여넣고 실행합니다.
9. `supabase/migrations/006_allow_own_entry_comments.sql` 파일의 전체 내용을 붙여넣고 실행합니다.
10. **Table Editor**에서 `entries`, `profiles`, `qt_entries`, `qt_comments`, `daily_scriptures` 테이블이 생겼는지 확인합니다.

1. `supabase/migrations/001_create_entries.sql`
2. `supabase/migrations/002_family_members_and_roles.sql`

## 3. 회원가입 설정

회원가입 화면에서 이메일, 비밀번호, 별명을 입력합니다. 비밀번호는 Supabase Auth가 관리하고 별명만 `profiles` 테이블에 저장됩니다.

1. Supabase Dashboard의 **Authentication → Providers → Email**로 이동합니다.
2. 이메일 인증을 사용할 경우 **Confirm email**을 켭니다.
3. 개발 중 이메일 확인 없이 바로 가입하려면 **Confirm email**을 끕니다.
4. 배포 주소를 **Authentication → URL Configuration**의 Site URL에 등록합니다.

## 3. 관리자와 가족 계정 만들기

Supabase Dashboard의 **Authentication → Users → Add user**에서 관리자와 가족 계정을 만듭니다.

v2.0 migration 실행 후 새로 만든 계정은 자동으로 `member`가 됩니다. 최고 관리자 계정은 SQL Editor에서 아래처럼 `admin`으로 바꿉니다.

```sql
update public.profiles
set role = 'admin', display_name = '가족 관리자'
where id = (
  select id
  from auth.users
  where email = '관리자이메일@example.com'
);
```

예시 이메일을 실제 관리자 이메일로 바꿔 실행합니다. 가족 이름도 같은 방식으로 `display_name`만 변경할 수 있습니다.

```sql
update public.profiles
set display_name = '가족 이름'
where id = (
  select id
  from auth.users
  where email = '가족이메일@example.com'
);
```

현재 역할을 확인하려면 아래 SQL을 사용합니다.

```sql
select u.email, p.display_name, p.role
from public.profiles as p
join auth.users as u on u.id = p.id
order by p.created_at;
```

## 4. 환경변수 연결

프로젝트 루트의 `.env.local`에 Supabase **Project URL**과 **Publishable key**를 입력합니다.

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

service role 또는 secret key를 브라우저 환경변수에 넣지 않습니다. `.env.local`은 Git에 포함되지 않습니다.

## 5. 화면 확인

1. `/`의 회원가입 탭에서 이메일, 비밀번호, 별명을 입력합니다.
2. 이메일 인증이 켜져 있으면 받은 메일의 링크를 누른 뒤 로그인합니다.
3. 로그인 후 Bible Hunter 화면에 가입한 별명이 보이는지 확인합니다.
4. Supabase **Table Editor → profiles**에서 사용자 ID와 별명을 확인합니다.
5. 로그아웃 후 이메일과 비밀번호로 다시 로그인되는지 확인합니다.

로그아웃한 상태로 `/family`, `/entries/[id]`, `/admin`, `/account`를 열면 `/login`으로 이동합니다.

다음 달 QT 본문을 추가할 때는 [`guides/daily-scripture-management.md`](guides/daily-scripture-management.md)의 SQL 예시를 사용합니다.

## 6. GitHub에 저장하기

계정을 두 개 이상 만들고 아래 순서로 확인합니다.

1. 가족 A `Member` 계정으로 로그인해 글을 작성합니다.
2. 가족 A에게 자기 글의 삭제 버튼이 보이는지 확인합니다.
3. 가족 B `Member` 계정으로 로그인해 가족 A의 글을 읽습니다.
4. 가족 B에게 가족 A 글의 삭제 버튼이 보이지 않는지 확인합니다.
5. 최고 관리자 `Admin` 계정으로 로그인해 모든 글에 삭제 버튼이 보이는지 확인합니다.
6. 로그아웃한 뒤 가족 게시판이 열리지 않는지 확인합니다.

화면에서 버튼을 숨기는 것과 별개로 Supabase RLS가 같은 권한을 데이터베이스에서 다시 강제합니다.

## 7. 디자인 레퍼런스 활용

1. Google 이미지에서 `app design reference`를 검색합니다.
2. 원하는 화면 이미지 1~3장을 Codex 채팅에 첨부합니다.
3. 마음에 드는 색상, 카드, 글자, 메뉴를 설명합니다.
4. 레퍼런스를 그대로 복제하지 않고 프로젝트의 내용과 화면에 맞게 적용합니다.

현재 v2.0은 밝은 흰색 화면, 연한 회색 배경, 보라색 포인트, 둥근 카드, 프로필 표시, 모바일 하단 내비게이션을 사용합니다.

## 8. Vercel 배포

1. GitHub 저장소에 변경 내용을 push합니다.
2. Vercel 프로젝트에서 새 커밋을 배포합니다.
3. 아래 환경변수가 Production에 등록되어 있는지 확인합니다.
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. 배포 주소 `/`가 로그아웃 상태에서 열리는지 확인합니다.
5. `/family`가 로그인 화면으로 이동하는지 확인합니다.
6. Member와 Admin 계정으로 역할별 테스트를 반복합니다.

## 9. 이번 버전에서 제외한 기능

- 글마다 외부 공개 여부 선택
- 공개 회원가입과 초대 메일
- 사진과 파일 업로드
- 댓글, 반응, 알림
- 글 수정
- 카테고리와 검색

외부에 일부 글을 공개하는 기능은 역할별 가족 게시판이 안정적으로 작동한 뒤 v2.1에서 추가할 수 있습니다.

## Codex와 작업하기

- 프로젝트 전체 기획: `프로젝트 시작 워크시트를 작성할게요.`
- 작은 작업 정리: `오늘의 주문서를 작성할게요.`
- 승인한 주문 구현: `이 주문서대로 작업해주세요.`

### 오늘 할 일 한 가지 정리하기

```text
오늘의 주문서를 작성할게요.
```

Codex는 `guides/order-flow.md`를 따라 작은 작업 하나로 정리하고 초안을 보여줍니다. 승인된 주문서는 `orders/`에 날짜별로 저장됩니다.

### 승인한 주문 구현하기

```text
이 주문서대로 작업해주세요.
```

Codex는 승인된 주문서 범위만 구현하고 lint와 build 결과를 같은 주문서에 기록합니다.

## 9. 자주 생기는 문제

### `npm` 명령을 찾을 수 없습니다

Node.js가 설치되지 않은 상태입니다. Node.js 20.9 이상을 설치한 뒤 새 터미널을 열어 다시 실행합니다.

### Supabase 연결 안내만 보입니다

`.env.local` 파일 위치와 환경변수 이름을 확인하고 개발 서버를 다시 시작합니다. 값 앞뒤의 불필요한 공백도 확인합니다.

### 회원가입 또는 로그인이 되지 않습니다

`002_create_profiles.sql`을 실행했는지 확인하고 Supabase Dashboard의 **Authentication → Users**에서 사용자가 생성됐는지 살펴봅니다. 이메일 인증이 켜져 있으면 인증 메일을 먼저 확인해야 합니다.

### 저장할 수 없습니다

로그인 상태, `entries` migration 실행 여부, Supabase **Logs**, 환경변수 설정을 차례로 확인합니다. 제목은 120자, 내용은 5,000자 이하여야 합니다.

### 공개 화면에 내용이 보이지 않습니다

SQL Editor에서 migration 전체가 오류 없이 실행되었는지 확인합니다. `entries` 테이블의 RLS와 `Anyone can read entries` 정책도 확인합니다.

### Vercel에서만 연결되지 않습니다

Vercel 프로젝트의 환경변수 두 개가 Production 환경에 등록되었는지 확인한 뒤 다시 배포합니다. `.env.local`은 Vercel에 자동 업로드되지 않습니다.

## 10. 이번 버전의 범위

현재는 텍스트 작성과 공개 조회에 집중합니다. 카메라, 이미지 촬영, 파일 업로드, Supabase Storage는 텍스트 흐름이 안정적으로 작동한 뒤 별도 주문으로 진행합니다. 수정·삭제를 위한 본인 데이터 권한은 SQL에 준비되어 있지만 화면은 아직 없습니다.

## 주요 폴더

```text
app/                    화면과 Server Actions
components/             반복해서 쓰는 화면 요소
lib/supabase/           브라우저·서버·세션 연결
supabase/migrations/    데이터베이스와 보안 정책 SQL
guides/                 Codex 인터뷰 진행 순서
worksheets/             프로젝트 시작 양식
orders/                 날짜별 작업 주문서
```

기술 기준은 [Next.js 16 Proxy 문서](https://nextjs.org/docs/app/getting-started/proxy)와 [Supabase SSR 클라이언트 문서](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs&queryGroups=framework)를 따릅니다.
