# EventSphere

A full-stack event management platform. People browse events and reserve seats. Organizers publish events and manage their guest lists. Admins manage user roles.

| Folder | Stack |
| --- | --- |
| [`backend/`](backend) | Node.js, Express 5, MongoDB (Mongoose), JWT, Joi, bcrypt |
| [`frontend/`](frontend) | React 19, Vite, TypeScript, Tailwind CSS v4, shadcn/ui, TanStack Query, React Hook Form + Zod |

## Quick start

Requirements: Node.js 20+ and either Docker or a MongoDB connection string.

```bash
# 1. Start MongoDB (skip if you use Atlas; set MONGO_URI in backend/.env instead)
docker compose up -d

# 2. API on http://localhost:5050
cd backend
cp .env.example .env          # then replace the two JWT secrets
npm install
npm run seed                  # ~30 events, 65 users, 1,200+ reservations (wipes existing data)
npm run dev

# 3. Web app on http://localhost:5173 (in a second terminal)
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` to the backend, so the browser treats the API as same-origin and the HTTP-only cookies work without extra CORS setup.

> The API uses port **5050** because macOS reserves port 5000 for AirPlay Receiver.

### Demo accounts (after `npm run seed`)

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@eventsphere.dev | Admin@1234 |
| Organizer | organizer@eventsphere.dev | Organizer@1234 |
| Organizer | marcus@eventsphere.dev, priya@eventsphere.dev | Organizer@1234 |
| Attendee | attendee@eventsphere.dev | Attendee@1234 |

In development, the login page has buttons that fill these in.

The seed also creates 60 demo attendees (`maya.chen.1@example.com` and so on, password `Demo@1234`). Every event's seat count is backed by real registrations, so the attendee lists match the numbers.

The catalog lives in `backend/src/scripts/seedData.js` and spans 12 cities and every category. It includes past events, one draft, one cancelled event and one sold-out event. Dates are relative to the day you run the seed, so "upcoming" stays upcoming.

> `npm run seed` **deletes all users, events, registrations and sessions** in the database `MONGO_URI` points to before inserting the demo data.

## Backend

```
backend/src
├── config/        env validation (Joi), Mongo connection
├── models/        User, Session, Event, Registration (with indexes)
├── validators/    Joi schemas for body / query / params
├── middlewares/   validate, authenticate / authorize (RBAC), rate limit, errors
├── services/      business logic (auth, tokens, events, users)
├── controllers/   thin HTTP layer → ApiResponse
├── routes/        /api/v1 routers
└── scripts/       seed.js + seedData.js (demo catalog)
```

### Authentication and sessions

- **Access token**: 15 minutes, in an HTTP-only `accessToken` cookie.
- **Refresh token**: 7 days, in an HTTP-only `refreshToken` cookie scoped to `/api/v1/auth`. Neither token ever appears in a response body.
- Each login creates a **Session** document holding a SHA-256 hash of the refresh token. Every request checks that the session is still active, so logging out or revoking a session takes effect immediately.
- **Refresh token rotation with reuse detection**: each refresh issues a new token. If an older token is presented again, every session for that user is revoked. A 30-second grace window stops two tabs that refresh at the same moment from being treated as reuse.
- Passwords are hashed with bcrypt (12 rounds). Unknown emails are compared against a dummy hash so response timing doesn't reveal which accounts exist.
- Login and register are rate limited per IP (`AUTH_RATE_LIMIT_MAX` per 15 minutes).
- Roles are loaded fresh on every request, so an admin's role change applies to that user's next request.

### Data integrity and performance

- Seats are reserved with a single atomic `findOneAndUpdate` guarded by `registeredCount < capacity`, so concurrent requests can't oversell an event. A unique `{event, user}` index blocks duplicate registrations.
- Indexes:
  - Weighted text index on `title`, `description` and `tags`
  - Compound indexes for `{status, startDate}`, `{status, category, startDate}` and `{organizer, createdAt}`
  - TTL index that removes expired sessions
- List endpoints use `lean()` and projections, and run the `find` and `countDocuments` queries in parallel.
- Joi strips unknown keys from bodies, queries and params. This also blocks operator-injection payloads such as `{"$gt": ""}`.

### API (`/api/v1`)

| Method | Path | Access |
| --- | --- | --- |
| POST | `/auth/register` | Public (rate limited); `role` may be `attendee` or `organizer` |
| POST | `/auth/login` | Public (rate limited) |
| POST | `/auth/refresh` | Refresh cookie |
| POST | `/auth/logout` | Refresh cookie |
| POST | `/auth/logout-all` | Signed in |
| GET | `/auth/me` | Signed in |
| GET | `/auth/sessions` | Signed in |
| DELETE | `/auth/sessions/:id` | Signed in |
| GET | `/events?search&category&city&from&to&when&sort&page&limit` | Public (published events only) |
| GET | `/events/mine` | Organizer, admin |
| GET | `/events/:id` | Public (drafts visible to owner and admins only) |
| POST | `/events` | Organizer, admin |
| PATCH / DELETE | `/events/:id` | Owner or admin |
| POST / DELETE | `/events/:id/register` | Signed in |
| GET | `/events/:id/attendees` | Owner or admin |
| GET | `/users/me/registrations` | Signed in |
| GET | `/users` | Admin |
| PATCH | `/users/:id/role` | Admin (can't change own role) |
| GET | `/health` | Public |

Success responses look like `{ "success": true, "message": "...", "data": { ... } }`. Errors look like `{ "success": false, "message": "...", "errors": [{ "field", "message" }] }`.

### Tests

```bash
cd backend && npm test
```

The tests use Node's built-in test runner with Supertest and an in-memory MongoDB. They cover:

- Registration and login cookies
- Validation errors
- Refresh rotation and reuse detection
- Logout and session revocation
- RBAC
- Ownership checks
- Capacity limits, including concurrent sign-ups
- Draft visibility
- Search and filtering

## Frontend

```
frontend/src
├── api/           typed request functions
├── hooks/         TanStack Query hooks (auth, events, users)
├── lib/           axios client with silent refresh, query client, formatting, errors
├── schemas/       Zod schemas mirroring the API's Joi rules
├── components/    layout, auth guards, event cards/tickets, shadcn/ui
└── pages/         Landing, Login, Signup, Events, EventDetail, Dashboard,
                   EventEditor, Attendees, Profile, AdminUsers
```

- **Silent refresh**: when a request returns 401, the axios client calls `/auth/refresh` once, shares that call with any other request that failed at the same moment, and replays the original request. If the refresh fails, the cached user is cleared and the route guards send the person to `/login`.
- **Route guards**:
  - `RequireAuth` protects signed-in pages and can also require roles.
  - `GuestOnly` keeps signed-in users off `/login` and `/signup`, and sends them back to the page they came from after they authenticate.
- **Forms**: Zod validates in the browser. Field errors from the API are mapped back onto the matching inputs.
- **Design**: dark "stage lighting" theme with glass surfaces. Event cards are styled as admission tickets with perforated stubs. Display type is Bricolage Grotesque and body text is Instrument Sans.

```bash
cd frontend
npm run build   # type-check + production build
npm run lint
```

## Deployment: backend on Render, frontend on Vercel

The browser only ever talks to the Vercel domain. [`frontend/vercel.json`](frontend/vercel.json) rewrites `/api/*` to the Render service, just as the Vite proxy does in development. The auth cookies are therefore first-party (`SameSite=Strict`), work in every browser including Safari and iOS, and no CORS setup is needed.

```
browser ──► https://<app>.vercel.app/api/v1/...  ──(Vercel rewrite)──►  https://<app>.onrender.com/api/v1/...
```

### Render (backend)

| Setting | Value |
| --- | --- |
| Root directory | `backend` |
| Build command | `npm ci` |
| Start command | `npm start` |
| Health check path | `/api/v1/health` |

| Environment variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `MONGO_URI` | Atlas connection string |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | two different random strings, 32+ characters |
| `CLIENT_URL` | `https://<app>.vercel.app` |

- To allow Vercel preview deployments, add a wildcard origin: `CLIENT_URL=https://<app>.vercel.app,https://<app>-*.vercel.app`. A `*` matches one subdomain label.
- Render sets `PORT` itself. `TRUST_PROXY` defaults to `1`, which counts Render's load balancer.

### Vercel (frontend)

Set the root directory to `frontend` (framework preset: Vite); no environment variables are required. [`frontend/vercel.json`](frontend/vercel.json) does two things:

- It proxies `/api/*` to the Render URL. Update the URL there if your service name changes.
- It serves `index.html` for every other path, so client-side routes like `/events/123` survive a page refresh.

### Notes

- **CSRF protection:** every `POST`, `PATCH` and `DELETE` must come from an origin in `CLIENT_URL`, or the API returns 403 ([`originCheck.js`](backend/src/middlewares/originCheck.js)). Through the rewrite, the browser still sends the Vercel domain as `Origin`, which is why `CLIENT_URL` must list it.
- **Cold starts:** Render's free plan sleeps after inactivity, and the first request can take 20–50 seconds. Vercel waits up to 120 seconds for the backend, so the first request is slow but doesn't fail.
- **Rate limits:** login and register are rate limited per client IP. Check that `req.ip` is the visitor's IP rather than Vercel's. If every request appears to come from Vercel, raise `TRUST_PROXY` to `2`.
