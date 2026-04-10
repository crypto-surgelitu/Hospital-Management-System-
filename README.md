# HMS Meru

Hospital Management System with a React frontend, an Express backend, and a preserved legacy PHP implementation kept outside the active app structure.

## Repository Layout

```text
backend/
  database/
    schema.sql
    seeds/
  src/
    config/
    controllers/
    middleware/
    routes/
    server.js
  package.json

frontend/
  public/
  src/
  package.json
  vite.config.js

legacy/
  php/

docs/
  contracts/
  QA_Report.md
```

## Active Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MySQL

## Setup

1. Import `backend/database/schema.sql` into MySQL.
2. Optionally import seed data from `backend/database/seeds/`.
3. Configure backend environment variables in `backend/.env`.
4. From `backend/`, run `npm install` and `npm run dev`.
5. From `frontend/`, run `npm install` and `npm run dev`.

## Notes

- The legacy PHP codebase is preserved under `legacy/php/`.
- The active application is now organized around `frontend/` and `backend/`.
