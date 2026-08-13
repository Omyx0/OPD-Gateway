# Backend integration guide (for Google Antigravity)

This Lovable project is **frontend-only by design**. It runs with no backend,
no database, no authentication server, no API keys and no external services.
Everything is in-memory mock data behind a service layer.

## Verified frontend-only status

The repository contains **none** of the following:

- Supabase client, migrations or `supabase/` directory
- `createServerFn` server functions
- `src/routes/api/*` server routes
- database drivers or ORM packages
- `.env` files, secrets or `process.env` reads in app code
- `fetch` / `axios` / WebSocket / SSE / Realtime calls
- Gemini, OpenAI, OCR or any third-party SDK
- push notifications, service workers or persistent storage

`src/server.ts` is the framework's SSR entry point (renders the same React app,
holds no application logic). The only remote asset is the Inter web font from
Google Fonts; the app falls back to `system-ui` and renders fine offline.

## The seam to replace

All UI reads and writes go through `src/services/`. No component or state
provider imports `@/mock/*`. To go live, rewrite only the bodies in
`src/services/` — keep the exported interfaces in `src/services/types.ts` and
the component tree keeps compiling.

| Service          | Methods                                                                                                                                                                               | Suggested REST mapping                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `patientService` | `listPatients`, `getPatient`, `scanIdDocument`, `emptyRecord`, `listInsuranceProviders`                                                                                               | `GET /patients`, `GET /patients/:id`, `POST /ocr/id-scan`, `GET /insurance-providers`    |
| `visitService`   | `getVisitRecord`, `getTriageRecord`                                                                                                                                                   | `GET /visits/:id`, `GET /visits/:id/triage`                                              |
| `triageService`  | `getQuestions`, `getDisclaimer`, `detectRedFlag`, `assessAnswers`, `getResult`, `getProcessingSteps`, `getPriorityLabel`, `getPriorityStatusLine`                                     | `GET /triage/questions`, `POST /triage/assess` (AI/Gemini lives here)                    |
| `queueService`   | `getQueue`, `listDepartmentNames`, `nextToken`, `createEntry`, `applyStatus`, `applyDepartment`, `selectNext`, `positionOf`, `positionForPriority`, `getTracking`, `getTrackingOrder` | `GET /queue`, `POST /queue`, `PATCH /queue/:id`, `GET /queue/:token/tracking`            |
| `staffService`   | `signIn`, `signOut`, `listDepartments`, `getDepartmentSnapshots`, `getHourlyThroughput`                                                                                               | `POST /auth/login`, `POST /auth/logout`, `GET /departments`, `GET /analytics/throughput` |
| `alertService`   | `getAlerts`, `createAlertForEntry`, `applyAcknowledged`, `getNotifications`, `createNotification`                                                                                     | `GET /alerts`, `POST /alerts`, `PATCH /alerts/:id`, `GET /notifications`                 |
| `demoService`    | scripted demo journeys                                                                                                                                                                | **Delete** once real data exists (also delete `DemoScenarioBar` and `src/mock/`)         |

### Notes for the integration pass

- Several methods are synchronous today because state lives in memory. When
  they become network calls, make them `Promise`-returning and consume them
  with TanStack Query (already installed) inside the existing state providers
  (`src/state/staff-store.tsx`, `notifications.tsx`, `staff-auth.tsx`).
- `staff-auth.tsx` holds a mock session only — no tokens, no persistence.
  Replace with the real auth provider and guard `src/routes/staff.tsx`.
- Live queue updates are local state; swap for polling or a socket in
  `staff-store.tsx` only.
- `src/state/connection.tsx` simulates offline/online for demo purposes; point
  it at real request health when the API exists.
