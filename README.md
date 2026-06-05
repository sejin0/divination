# I Ching AI

주역 64괘와 AI 해석을 결합한 개인 상담 MVP입니다.

## 핵심 규칙

괘 코드는 샘플 애니메이션과 동일하게 **아래 효에서 위 효 순서**로 저장합니다.

예를 들어 `currentHexagram = [1, 1, 1, 1, 0, 1]`이면 DB의 `hexagrams.code`는 `111101`입니다. 화면 렌더링만 위에서 아래로 보이도록 역순으로 그립니다.

## Stack

- Next.js 15 App Router
- React 19
- TypeScript strict mode
- Tailwind CSS
- Neon PostgreSQL
- Drizzle ORM
- Auth.js / NextAuth
- OpenAI Responses API
- Vercel

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local`에 최소한 다음 값을 설정합니다.

```bash
DATABASE_URL=
AUTH_SECRET=
AUTH_URL=http://localhost:3000
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.2
```

Google 로그인까지 사용할 때는 아래 값도 추가합니다.

```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Database

이미 Neon SQL Editor에서 테이블을 생성했다면, 다음 seed를 실행하세요.

- `outputs/seed_hexagrams.sql`

확인 쿼리:

```sql
select count(*) from hexagrams;
```

결과가 `64`이면 정상입니다.

## Development Flow

1. 질문 입력
2. 클라이언트에서 샘플과 동일한 0.8초 간격으로 6효 생성
3. 생성된 `lines` 배열을 `/api/divination`에 전달
4. 서버에서 같은 `lines`로 `hexagram_code` 생성
5. Neon의 `hexagrams`에서 괘 데이터 조회
6. OpenAI Responses API로 상담 해석 생성
7. `questions`, `divinations`, `ai_logs`에 저장
8. 결과 화면 표시

## Deploy To Vercel

1. GitHub에 이 프로젝트를 push합니다.
2. Vercel에서 `New Project`를 누르고 GitHub repo를 import합니다.
3. Framework Preset은 `Next.js`로 둡니다.
4. Environment Variables에 `.env.example`의 값을 등록합니다.
5. Deploy를 실행합니다.

Vercel 배포 후 Google 로그인 callback URL은 다음 형식으로 Google Cloud Console에 등록합니다.

```text
https://YOUR_PROJECT.vercel.app/api/auth/callback/google
```
