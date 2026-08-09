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

처음 만드는 프로젝트라면 Supabase **SQL Editor**에서 아래 파일을 순서대로 실행합니다.

1. `supabase/migrations/001_create_entries.sql`
2. `supabase/migrations/002_family_members_and_roles.sql`

이미 v1.0 migration을 실행했다면 두 번째 파일만 실행합니다.

v2.0 migration은 다음 내용을 적용합니다.

- `profiles` 테이블과 `admin`·`member` 역할
- 새 Auth 사용자의 가족 프로필 자동 생성
- 기존 Auth 사용자의 가족 프로필 생성
- 외부 방문자의 글 조회 차단
- 가족 회원의 전체 글 조회와 자기 글 삭제
- 관리자의 모든 글 삭제

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

| 주소 | 역할 |
| --- | --- |
| `/` | 외부 공개용 프로젝트 소개 |
| `/login` | 관리자와 가족 공용 로그인 |
| `/family` | 로그인한 가족만 보는 글 목록 |
| `/entries/[id]` | 로그인한 가족만 보는 상세 글 |
| `/admin` | 로그인한 가족의 새 글 작성 |
| `/account` | 이름, 역할, 현재 권한, 로그아웃 |

로그아웃한 상태로 `/family`, `/entries/[id]`, `/admin`, `/account`를 열면 `/login`으로 이동합니다.

## 6. 역할별 테스트

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

관련 문서는 `worksheets/`, `guides/`, `orders/`에서 확인합니다.
