# CultureMetrics Architecture

## Overview

CultureMetrics is a monorepo containing two independent applications:

```
client/   React SPA (Vite + Tailwind + Recharts)
server/   Express API (Node.js + PostgreSQL + Sequelize)
```

## Data Flow

```
Browser
  └─ React SPA (client/)
       └─ Axios HTTP → CultureMetrics API (server/)
            ├─ Auth middleware (JWT)
            ├─ Analytics services
            │    └─ DataProvider
            │         ├─ MockProvider (DATA_MODE=mock)
            │         └─ CultureFrameAdapter (DATA_MODE=live)
            │              └─ CultureFrameClient (HTTP → CultureFrame)
            ├─ Sync service → PostgreSQL (analytics_snapshots)
            └─ CSV reporter
```

## Backend Layers

| Layer | Files | Responsibility |
|---|---|---|
| Routes | `src/routes/*.routes.js` | URL mapping, middleware chain |
| Controllers | `src/controllers/*.controller.js` | Request/response handling |
| Services | `src/services/analytics/` | Metric calculations |
| Integration | `src/services/cultureframe/` | CultureFrame API client, adapter, normalizer, mock |
| Models | `src/models/` | Sequelize ORM models |
| Middleware | `src/middleware/` | Auth, validation, rate limiting, error handling |

## Key Design Decisions

- **Mock provider is isolated** — activated only when `DATA_MODE=mock`. Never mixed with live data.
- **Normalizer validates all source data** — records with invalid fields are rejected, not silently accepted.
- **Monetary values as strings** — all financial values flow as decimal strings to avoid float imprecision.
- **JWT in httpOnly cookie + sessionStorage fallback** — secure browser auth with non-cookie client support.
- **No CultureFrame DB access** — CultureMetrics only communicates through CultureFrame's REST API.
- **Synchronization is idempotent** — repeated syncs do not duplicate records; unique external IDs prevent double-counting.
