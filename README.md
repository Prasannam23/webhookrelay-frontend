# Relay — Frontend

Next.js (App Router) dashboard for the Webhook Relay backend. Minimal
console/relay-themed UI: register subscribers, watch deliveries update
live, and a Help page explaining the whole system for anyone new to it.

## Setup

```bash
npm install
cp .env.local.example .env.local
# edit .env.local if your backend isn't on localhost:4000
npm run dev
```

Open http://localhost:3000. Make sure the backend (`server.js`) and Redis
are running first — the dashboard needs both the REST API and the
Socket.IO connection.

## Structure

```
app/
  page.jsx              landing page
  login/, register/     auth pages
  dashboard/             subscriber list + create modal
  subscribers/[id]/      subscriber detail + live delivery log
  help/                  how the project works, API reference
components/               shared UI (Panel, Button, StatusDot, etc.)
store/                    useReducer-based global store
  actions.js              action type constants
  reducer.js              pure (state, action) -> state function
  AppContext.jsx           React Context wiring the reducer + localStorage
lib/                       API layer — each function calls the backend
                            and dispatches the result into the store
hooks/
  useSubscriberSocket.js   Socket.IO connection, dispatches live updates
```

## State management pattern

Every piece of shared state (auth, subscribers, live deliveries) flows
through one `useReducer` store (`store/reducer.js`), following the
classic action → reducer pattern:

```
component calls a function in lib/*.js
  → function calls the backend (lib/apiClient.js)
  → function dispatches an action (store/actions.js)
  → reducer computes new state (store/reducer.js)
  → components re-render via useAppStore()
```

Live delivery updates from the backend's Socket.IO server follow the
same path — `useSubscriberSocket` dispatches `UPSERT_DELIVERY` on every
`delivery:update` event, so the UI updates the same way whether the
data came from a REST call or a live push.
