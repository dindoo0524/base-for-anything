# 오늘의 주문서

- 주문 제목: Supabase 회원가입·로그인과 별명 프로필
- 날짜: 2026-08-11
- 작업 상태: 완료

## 오늘 만들 기능

Supabase Auth를 이용한 회원가입과 로그인 화면을 만들고, 회원가입할 때 입력한 별명을 사용자 프로필로 저장합니다.

## 작업하는 이유

Bible Hunter 사용자를 이메일과 비밀번호로 안전하게 인증하고 각 사용자의 별명을 계정에 연결하기 위해서입니다.

## 수정할 화면

- 회원가입·로그인 화면
- 로그인 후 Bible Hunter 화면
- 사용자 표시 및 로그아웃 영역

## 구체적인 요청

- 한 페이지에서 회원가입과 로그인을 전환할 수 있게 합니다.
- 로그인할 때 이메일과 비밀번호를 입력합니다.
- 회원가입할 때 이메일, 비밀번호, 별명을 입력합니다.
- 회원가입 성공 시 Supabase Auth 계정을 생성합니다.
- 별명은 인증 사용자 ID와 연결된 `profiles` 테이블에 저장합니다.
- 로그인 성공 후 Bible Hunter 화면을 표시합니다.
- 기존 브라우저 별명 입력 화면은 로그인한 사용자의 프로필 별명으로 대체합니다.
- 로그아웃 기능을 제공합니다.
- `profiles` 테이블과 RLS 정책을 설정할 SQL을 작성합니다.

## 반드시 유지할 기능

- Bible Hunter의 성경 범위 및 묵상 작성 흐름
- 가족별 월간 현황과 날짜별 말씀 비교
- Supabase RLS를 우회하지 않는 안전한 인증 구조
- 비밀번호는 별도 테이블에 저장하지 않고 Supabase Auth에서만 관리

## 이번에는 하지 않을 작업

- 카메라 기능
- Supabase Storage 연동
- 소셜 로그인
- 비밀번호 찾기
- 관리자용 회원 관리 화면

## 완료 조건

- 회원가입 화면에서 이메일, 비밀번호, 별명을 입력할 수 있습니다.
- 로그인 화면에서는 이메일과 비밀번호만 입력합니다.
- 인증된 사용자의 별명을 `profiles` 테이블에서 조회할 수 있습니다.
- 로그인과 로그아웃 흐름이 동작합니다.
- 필요한 SQL과 환경 설정 방법이 제공됩니다.
- 관련 lint와 build가 통과합니다.

## 작업 후 사용자가 확인할 내용

- 회원가입 후 Supabase Auth에 사용자가 생성되는지 확인합니다.
- `profiles` 테이블에 같은 사용자 ID와 별명이 저장되는지 확인합니다.
- 이메일과 비밀번호로 로그인되는지 확인합니다.
- 로그인 후 Bible Hunter가 표시되고 로그아웃할 수 있는지 확인합니다.

## Codex 작업 결과

- 루트 화면에 로그인과 회원가입을 전환하는 인증 폼을 추가했습니다.
- 회원가입할 때만 별명을 입력하고 Supabase Auth 사용자 메타데이터로 전달합니다.
- 인증된 사용자의 `profiles` 별명을 조회해 Bible Hunter 사용자로 연결했습니다.
- 기존 별명 입력·사용자 변경 흐름을 제거하고 로그아웃으로 교체했습니다.
- `profiles` 테이블, 신규 사용자 프로필 생성 트리거, 사용자 본인 전용 RLS 정책 migration을 추가했습니다.
- Supabase Dashboard에서 migration과 이메일 인증을 설정하는 방법을 README에 기록했습니다.

## 변경한 파일

- `app/page.tsx`
- `app/globals.css`
- `components/auth-form.tsx`
- `components/bible-hunter.tsx`
- `supabase/migrations/002_create_profiles.sql`
- `README.md`
- `orders/2026-08-11-02-supabase-auth-profile.md`

## 실행 및 검증 결과

- `npm.cmd run lint`: 통과
- `npm.cmd run build`: 통과
- Next.js 컴파일과 TypeScript 검사: 통과

## 남아 있는 문제

- Supabase Dashboard의 SQL Editor에서 `supabase/migrations/002_create_profiles.sql`을 실행해야 실제 `profiles` 테이블과 RLS 정책이 생성됩니다.
- 실제 회원가입·로그인 검증은 연결된 Supabase 프로젝트에서 migration 실행 후 확인해야 합니다.
