# 월별 QT 본문 추가 방법

한 달치 본문은 Supabase SQL Editor에서 한 번에 추가합니다. 날짜마다 화면에서 입력하는 것보다 빠르고 실수가 적습니다.

## 처음 한 번만 할 일

1. Supabase Dashboard에서 프로젝트를 엽니다.
2. 왼쪽 메뉴에서 **SQL Editor**를 엽니다.
3. `supabase/migrations/005_create_daily_scriptures.sql`의 전체 내용을 붙여넣습니다.
4. **Run**을 누릅니다.
5. Table Editor에서 `daily_scriptures` 테이블과 2026년 8월·9월 자료를 확인합니다.

## 다음 달 본문 추가하기

아래 형식으로 날짜와 본문을 한 줄씩 작성합니다. 마지막 줄을 제외한 각 줄 끝에는 쉼표를 넣습니다.

```sql
insert into public.daily_scriptures (reading_date, scripture)
values
  ('2026-10-01', '본문 입력'),
  ('2026-10-02', '본문 입력'),
  ('2026-10-03', '본문 입력')
on conflict (reading_date) do update
set scripture = excluded.scripture;
```

SQL Editor에 붙여넣고 **Run**을 누르면 됩니다. 같은 날짜를 다시 실행하면 중복으로 생기지 않고 본문만 새 내용으로 바뀝니다.

## 입력 결과 확인하기

아래 조회문에서 연도와 월만 바꿔 실행합니다.

```sql
select reading_date, scripture
from public.daily_scriptures
where reading_date >= '2026-10-01'
  and reading_date < '2026-11-01'
order by reading_date;
```

한 달의 모든 날짜가 순서대로 보이면 완료입니다. 앱은 로그인한 기기의 오늘 날짜와 같은 행을 자동으로 읽습니다.

## 주의할 점

- 날짜는 반드시 `연도-월-일` 형식으로 입력합니다. 예: `2026-10-01`
- 작은따옴표와 쉼표를 지우지 않습니다.
- 본문을 수정하려면 같은 날짜로 다시 실행합니다.
- Supabase의 service role key를 앱이나 문서에 입력하지 않습니다.
