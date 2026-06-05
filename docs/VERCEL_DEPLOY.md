# Vercel Deployment Checklist

## 1. Push To GitHub

```bash
git init
git add .
git commit -m "Initial I Ching AI MVP"
git branch -M main
git remote add origin https://github.com/YOUR_ID/YOUR_REPO.git
git push -u origin main
```

## 2. Import In Vercel

- Go to Vercel Dashboard.
- Select `New Project`.
- Import the GitHub repository.
- Keep Framework Preset as `Next.js`.

## 3. Environment Variables

Required:

```text
DATABASE_URL
AUTH_SECRET
AUTH_URL
OPENAI_API_KEY
OPENAI_MODEL
```

Optional for Google login:

```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

For production:

```text
AUTH_URL=https://YOUR_PROJECT.vercel.app
OPENAI_MODEL=gpt-5.2
```

## 4. Verify

After deploy:

```sql
select count(*) from hexagrams;
```

The result must be `64`.

Open the deployed app and test:

1. Enter a question.
2. Confirm six lines appear one by one.
3. Confirm result page appears.
4. Confirm a row is inserted into `questions`.
5. Confirm a row is inserted into `divinations`.
6. Confirm a row is inserted into `ai_logs`.
