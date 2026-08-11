# Base for Anything

> **프로젝트 시작:** `프로젝트 시작 워크시트를 작성할게요.`<br>
> **오늘의 작업 정리:** `오늘의 주문서를 작성할게요.`<br>
> **주문 승인 후 구현:** `이 주문서대로 작업해주세요.`

Base for Anything은 코딩 초보자가 Codex와 대화하며 작은 웹 서비스를 만드는 출발점입니다. 관리자가 작성한 내용은 Supabase 데이터베이스에 저장되고, 가족이나 지인은 로그인 없이 같은 URL에서 최신 내용을 볼 수 있습니다.

현재 준비된 첫 경험은 다음과 같습니다.

1. 관리자가 이메일과 비밀번호로 로그인합니다.
2. 제목과 내용을 작성해 저장합니다.
3. 공개 화면에 최신 내용부터 나타납니다.
4. Vercel에 배포한 주소를 가족에게 공유합니다.

회원가입, 수정·삭제 화면, 사진 업로드는 첫 버전에 포함하지 않았습니다.

## 1. 첫 실행

터미널에서 프로젝트 폴더로 이동한 뒤 실행합니다.

```bash
npm install
npm run dev
```

터미널에 표시된 로컬 주소를 브라우저에서 엽니다. Supabase를 아직 연결하지 않아도 앱은 중단되지 않고 설정 안내를 보여줍니다. 개발 서버를 멈추려면 터미널에서 `Control + C`를 누릅니다.

## 2. Supabase 프로젝트 만들기

1. [Supabase Dashboard](https://supabase.com/dashboard)에서 새 프로젝트를 만듭니다.
2. 프로젝트가 준비될 때까지 기다립니다.
3. 왼쪽 메뉴의 **SQL Editor**를 엽니다.
4. `supabase/migrations/001_create_entries.sql` 파일의 전체 내용을 붙여넣고 실행합니다.
5. `supabase/migrations/002_create_profiles.sql` 파일의 전체 내용을 붙여넣고 실행합니다.
6. `supabase/migrations/003_create_qt_entries_comments.sql` 파일의 전체 내용을 붙여넣고 실행합니다.
7. 기존 가입 계정이 있다면 `supabase/migrations/004_backfill_missing_profiles.sql` 파일도 실행합니다.
8. **Table Editor**에서 `entries`, `profiles`, `qt_entries`, `qt_comments` 테이블이 생겼는지 확인합니다.

이 SQL은 공개 조회와 로그인 사용자 본인 작성 정책을 분리하고 RLS를 켭니다. 익명 사용자는 내용을 읽을 수 있지만 추가·수정·삭제할 수 없습니다.

## 3. 회원가입 설정

회원가입 화면에서 이메일, 비밀번호, 별명을 입력합니다. 비밀번호는 Supabase Auth가 관리하고 별명만 `profiles` 테이블에 저장됩니다.

1. Supabase Dashboard의 **Authentication → Providers → Email**로 이동합니다.
2. 이메일 인증을 사용할 경우 **Confirm email**을 켭니다.
3. 개발 중 이메일 확인 없이 바로 가입하려면 **Confirm email**을 끕니다.
4. 배포 주소를 **Authentication → URL Configuration**의 Site URL에 등록합니다.

## 4. 환경변수 연결하기

Supabase 프로젝트의 **Connect** 화면에서 Project URL과 Publishable key를 확인합니다. service role key는 사용하지 않습니다.

프로젝트 루트에 `.env.local` 파일을 만들고 아래 두 환경변수 이름에 실제 값을 입력합니다. 이 파일은 Git에 포함되지 않습니다.

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

값을 저장한 뒤 개발 서버를 다시 시작합니다. 터미널이나 채팅에 실제 값을 출력하지 마세요.

## 5. 로컬 저장과 조회 확인

1. `/`의 회원가입 탭에서 이메일, 비밀번호, 별명을 입력합니다.
2. 이메일 인증이 켜져 있으면 받은 메일의 링크를 누른 뒤 로그인합니다.
3. 로그인 후 Bible Hunter 화면에 가입한 별명이 보이는지 확인합니다.
4. Supabase **Table Editor → profiles**에서 사용자 ID와 별명을 확인합니다.
5. 로그아웃 후 이메일과 비밀번호로 다시 로그인되는지 확인합니다.

실패하면 브라우저에 실제 비밀 값이 노출되지 않았는지 확인하고, Supabase의 **Logs**와 SQL 정책 실행 여부를 살펴봅니다.

## 6. GitHub에 저장하기

1. GitHub에서 새 저장소를 만듭니다.
2. 공개 또는 비공개 여부는 가족과 공유할 웹주소 공개 여부와 별개입니다. 코드에 담길 내용 기준으로 결정합니다.
3. GitHub가 안내하는 **기존 저장소 연결** 명령을 이 프로젝트 터미널에서 실행합니다.
4. `.env.local`이 업로드 목록에 없는지 반드시 확인한 뒤 push합니다.

원격 저장소 주소와 공개 여부는 프로젝트 소유자가 직접 결정합니다.

## 7. Vercel에 배포하기

1. [Vercel](https://vercel.com/)에 로그인하고 GitHub 저장소를 가져옵니다.
2. Framework Preset이 **Next.js**인지 확인합니다.
3. 프로젝트 설정의 **Environment Variables**에 아래 이름 두 개와 실제 값을 각각 등록합니다.
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. 배포합니다.
5. 배포 주소의 `/`에서 공개 목록을 확인합니다.
6. 배포 주소의 `/login`에서 로그인한 뒤 `/admin` 저장을 확인합니다.
7. 로그아웃한 브라우저에서도 `/`가 열리고 `/admin`은 로그인 화면으로 이동하는지 확인합니다.
8. 확인이 끝나면 Vercel이 제공한 공개 URL을 가족에게 공유합니다.

## 8. Codex와 프로젝트를 바꾸는 흐름

### 처음 아이디어 정리하기

Codex 채팅에 다음 문장을 입력합니다.

```text
프로젝트 시작 워크시트를 작성할게요.
```

Codex는 `guides/project-start-flow.md`를 따라 한 번에 하나씩 질문합니다. 종이에 작성한 답이 있으면 한꺼번에 입력해도 됩니다. 최종 초안을 확인하기 전에는 파일이나 앱 코드를 바꾸지 않습니다.

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
