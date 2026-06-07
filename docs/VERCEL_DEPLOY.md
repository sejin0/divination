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
```

AI Configuration (Choose your provider):

```text
# Provider Selection (google, anthropic, openai)
AI_PROVIDER=google
AI_MODEL=gemini-1.5-flash

# API Keys
GOOGLE_GENERATIVE_AI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
OPENAI_API_KEY=your_key
```

Optional for Google login:

```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

For production:

```text
AUTH_URL=https://YOUR_PROJECT.vercel.app
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
