# SmartJob — frontend

React + Vite frontend for the AI-Powered Smart Job Portal. It talks to the existing Spring Boot
microservices **only** through the API Gateway at `http://localhost:8080`. There is no mock
backend, no local fixture data, and no second data source.

---

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the production build
npm run lint
```

The gateway's CORS config allows exactly one origin:

```
spring.cloud.gateway.server.webflux.globalcors.cors-configurations.[/**].allowedOrigins=http://localhost:5173
```

so the dev server is pinned with `strictPort: true`. If port 5173 is busy, Vite will fail loudly
rather than silently start on 5174 and break every request with a CORS error.

The gateway URL lives in `.env`:

```
VITE_API_BASE_URL=http://localhost:8080
```

No JWT secret, database credential, OpenAI key or internal service key appears anywhere in this
project. The frontend only ever holds the token the login endpoint hands back.

### Backend services that must be up

`config-server` → `eureka-server` → `api-gateway`, plus `auth-service`, `user-service`,
`job-service`, `application-service`, `resume-service`, `notification-service`, `ai-service`,
and Kafka + PostgreSQL. Resume scoring and notifications are Kafka-driven, so without Kafka the
app still works but match scores never arrive.

---

## Endpoints used

Every call in `src/api/` was written against the actual controllers, not against assumptions.

| Feature | Call |
| --- | --- |
| Register | `POST /api/auth/register` → plain-text string |
| Login | `POST /api/auth/login` → `{ token, userId, email, role }` |
| Profile | `GET|PUT /api/users/{userId}/profile`, `POST /api/users/{userId}/profile?email=` |
| All profiles (admin) | `GET /api/users` |
| Jobs | `GET /api/jobs`, `GET /api/jobs/{id}`, `GET /api/jobs/employer/{employerId}` |
| Create job | `POST /api/jobs` |
| Job status | `PUT /api/jobs/{id}/status?status=CLOSED` — **query parameter** |
| Delete job | `DELETE /api/jobs/{id}` |
| Apply | `POST /api/applications` with `{ jobId, resumeId }` |
| My applications | `GET /api/applications/my` |
| Applications per job | `GET /api/applications/job/{jobId}` |
| Application status | `PUT /api/applications/{id}/status` with `{ "status": "SHORTLISTED" }` — **body** |
| Resume upload | `POST /api/resumes/upload` multipart: `file`, `primaryResume` |
| My resumes | `GET /api/resumes/my` |
| Delete resume | `DELETE /api/resumes/{id}` |
| AI for application | `GET /api/ai/applications/{applicationId}` |
| AI for resume | `GET /api/ai/resume/{resumeId}` |
| Notifications | `GET /api/notifications/my`, `PUT /api/notifications/{id}/read` |

`candidateId` and `employerId` are **never** sent from the client. Both are read from the JWT by
the backend.

---

## Where the original spec did not match the backend

These are deviations made deliberately after reading the controllers. Each one would have been a
runtime failure or a dead button if implemented as originally described.

**1. Application status is a body, not a query parameter.**
The spec said `PUT /api/applications/{id}/status?status=SHORTLISTED`. `ApplicationController`
takes `@Valid @RequestBody ApplicationStatusUpdateRequest`, so the real call is
`PUT /api/applications/{id}/status` with `{ "status": "SHORTLISTED" }`. Note that *job* status
uses the opposite convention — a query parameter — and the two are easy to mix up.

**2. There is no endpoint to edit a job.**
`job-service` exposes create, status-update and delete only. `/employer/jobs/:id/edit` is
therefore a **manage** screen: change status, review applicants, delete. The page says plainly
that the posting text cannot be edited, rather than showing a form that silently fails.

**3. `CreateJobRequest` has no `status` field.**
New jobs always default to `ACTIVE` (set in `Job.onCreate()`). The create form offers no status
picker; status is changed after publishing.

**4. AI analysis cannot be triggered on demand.**
`AiController` has two GETs and no POST. Analyses are created by the Kafka consumer in
`AiAnalysisService` when an application is submitted. `/ai-analysis` therefore browses existing
evaluations by application or by resume — it is not an "upload and analyse" tool. The
application detail page polls for a few seconds after applying and shows a "scoring" state while
the evaluation is in flight.

**5. Skill lists arrive as strings.**
`AiAnalysisService.join()` stores `extractedSkills`, `matchedSkills` and `missingSkills` as
comma-separated text. `parseSkills()` in `src/utils/format.js` splits them back into arrays.

**6. `Notification.isRead` serialises as `read`.**
Jackson derives the property name from the `isRead()` getter. `notificationSlice` accepts both
keys so it works either way.

**7. No employer-wide applications endpoint.**
`useEmployerApplications` fans out: employer's jobs → applications per job → evaluation and
candidate profile per application. The admin view does the same across all jobs.

**8. No saved-jobs feature exists.**
The dashboard's fourth statistic is "Under review" — a real number from real data — instead of a
"Saved jobs" counter with nothing behind it.

**9. No company entity.**
`/companies` is derived by grouping active jobs on `companyName`.

### One backend issue worth fixing

`user-service` guards `/api/users/**` with `anyRequest().authenticated()` and no ownership or
role check, so **any** signed-in user can fetch **any** profile by ID, and `GET /api/users`
returns every profile to anyone with a token. This frontend only ever requests profiles of
candidates who applied to the employer's own jobs, and only calls `GET /api/users` from admin
screens — but that is a UI convention, not enforcement. The check belongs in the service.

---

## Architecture

```
src/
├── api/          axios client + one module per service
├── components/
│   ├── ui/       design-system primitives (button, card, table, dialog, toast…)
│   ├── layout/   public header/footer, dashboard shell, page header, stat card
│   ├── jobs/     job card, filter panel
│   ├── applications/  status badges, timeline, employer status actions
│   ├── resume/   drag-and-drop uploader, resume card
│   ├── ai/       score ring, score bars, recommendation badge, evaluation panel
│   └── notifications/
├── hooks/        useAuth, useToast, useAsync, useAiScores, useEmployerApplications, useAdminData
├── pages/        public / seeker / employer / admin
├── routes/       PublicRoute, ProtectedRoute, RoleRoute, ScrollToTop
├── store/        Redux Toolkit slices + store
└── utils/        constants, formatters
```

### Authentication

`src/api/axios.js` holds no store reference directly; `src/store/index.js` injects a token getter
and a 401 handler into it. On any 401 the session is cleared, a toast explains why, and the user
lands on `/login?next=<where they were>`. The session is persisted to `localStorage` so a refresh
does not sign you out.

`RoleRoute` mirrors the role checks the backend already enforces. It hides the wrong UI; it does
not replace server-side authorisation.

### UI components

`shadcn/ui` could not be installed via its CLI in the build environment (`ui.shadcn.com` was not
reachable), so `src/components/ui/` is written by hand in the same pattern — `class-variance-authority`
for variants, `tailwind-merge` for class composition, no Radix dependency. The dialog implements
its own focus trap, Escape handling and focus restoration; the dropdown handles click-outside and
Escape; tabs support arrow-key navigation.

### States

Every data-driven page handles loading (skeletons), success, empty (`EmptyState`) and error
(`ErrorState` with a retry). Mutations report through toasts.

### Design

White background, `slate-50` for secondary surfaces, `slate-200` borders, `slate-900` text,
indigo `#4f46e5` as the single accent, with green/amber/red reserved for status meaning. Tokens
are CSS custom properties in `src/index.css`, consumed through Tailwind. Motion is limited to
hover/focus transitions, the score ring sweep, and toast/dialog entrances, and everything is
disabled under `prefers-reduced-motion`.

---

## Verified before shipping

- `npm run build` succeeds
- `npx eslint .` reports zero errors and zero warnings
- No unused components or dead files
- No mock or placeholder data — every figure on screen comes from the backend
- Client-side navigation throughout (no full page reloads)
- Responsive at 375px, 768px and 1280px
- Keyboard focus visible on every interactive element; forms labelled; tables scroll rather than
  overflowing the page

## Full stack with Docker Compose

The frontend is included in the root Docker Compose stack and served at http://localhost:5173. From the repository root, run `docker compose up --build`; the browser sends API requests to the gateway on localhost:8080.

Registration now collects a first and last name and creates the user profile after signing in. For accounts created earlier, a profile GET can return 404 until the user opens Profile and creates one.
