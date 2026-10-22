# NessFit Frontend

Production-oriented React frontend for a personal nutrition, health, workout and AI coaching platform.

## Run locally

```bash
npm install
npm run dev
```

Some product pages use realistic data from `src/mocks`. Authentication, account management, onboarding, nutrition targets, food search, food diary, saved foods, Body Progress, Dashboard nutrition/weight data, and Admin user/food management use the backend API through `src/services` and the Axios client in `src/api/client.ts`.

## Environment

`npm run dev` proxies `/api` to the local backend at `http://localhost:8080`. Create `.env.local` only when calling another API origin directly:

```env
VITE_API_URL=http://localhost:8080/api
```

The client sends cookies with requests. Access tokens are designed for in-memory/Zustand storage, while refresh tokens remain in backend-managed HttpOnly cookies.

## Main demo routes

- `/` — product landing page
- `/onboarding` — four-step profile and target setup
- `/dashboard` — daily nutrition and weight overview from the backend
- `/nutrition/search` — internal food database search and filtering
- `/nutrition/diary` — meal log and daily macro summary
- `/nutrition/saved` — saved food shortcuts
- `/progress` — real weight measurement history and trends
- `/workouts/session/session-push` — interactive training session
- `/ai` — context-aware assistant demo
- `/admin` — admin operations dashboard
- `/admin/foods` — Admin food CRUD with nutrition values per 100g

## Checks

```bash
npm run build
npm run lint
```
