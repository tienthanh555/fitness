# NessFit Frontend

Production-oriented React frontend for a personal nutrition, health, workout and AI coaching platform.

## Run locally

```bash
npm install
npm run dev
```

The demo uses realistic data from `src/mocks`. API requests are isolated in `src/services` and use the Axios client in `src/api/client.ts`.

## Environment

Create `.env.local` when connecting the backend:

```env
VITE_API_URL=http://localhost:3000/api
```

The client sends cookies with requests. Access tokens are designed for in-memory/Zustand storage, while refresh tokens remain in backend-managed HttpOnly cookies.

## Main demo routes

- `/` — product landing page
- `/onboarding` — four-step profile and target setup
- `/dashboard` — connected daily health overview
- `/nutrition/search` — external food provider search UX
- `/nutrition/diary` — meal log and daily macro summary
- `/progress`, `/water` — body and hydration trends
- `/workouts/session/session-push` — interactive training session
- `/ai` — context-aware assistant demo
- `/admin` — admin operations dashboard

## Checks

```bash
npm run build
npm run lint
```
