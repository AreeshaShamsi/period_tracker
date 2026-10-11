# Lunari Backend

Robust Fastify + PostgreSQL backend service for the **Lunari** Period Tracker application.

## 1. Project Structure

```text
backend/
├── src/
│   ├── config/
│   │   └── database.js             # PostgreSQL connection pool & connection checker
│   ├── controllers/
│   │   └── health.controller.js    # Health check handlers (API & DB status)
│   ├── routes/
│   │   └── health.routes.js        # Health check route definitions
│   ├── app.js                      # Fastify app setup, plugins & centralized error handling
│   └── server.js                   # Server bootstrap, DB verification & graceful shutdown
├── database/
│   └── schema.sql                  # Non-destructive initial database schema
├── .env                            # Local environment variables (ignored in Git)
├── .env.example                    # Environment configuration template
├── .gitignore                      # Git ignore rules for node_modules, .env, and logs
├── package.json                    # Dependencies, scripts, and project metadata
└── README.md                       # Documentation
```

## 2. Prerequisites

- **Node.js**: v18 or later
- **PostgreSQL**: v14+ (tested with PostgreSQL 18)
- Database created: `period_tracker`

## 3. Environment Setup

Copy `.env.example` to `.env` and configure your credentials:

```bash
cp .env.example .env
```

Ensure your `.env` contains:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/period_tracker
PORT=5000
HOST=0.0.0.0
NODE_ENV=development
```

> **Security Note**: Never commit `.env` or hardcode credentials into source code. `.env` is ignored by `.gitignore`.

## 4. Available Scripts

- **Test Database Connection**:
  ```bash
  npm run test:db
  ```
  Validates PostgreSQL connectivity using the shared pool configuration and exits with `0` on success or `1` on failure.

- **Start in Development Mode** (with hot reload via nodemon):
  ```bash
  npm run dev
  ```

- **Start in Production Mode**:
  ```bash
  npm run start
  ```

## 5. API Endpoints

| Method | Endpoint | Description | Success Status |
|---|---|---|---|
| `GET` | `/` | Service root message | 200 OK |
| `GET` | `/api/health` | Basic API uptime and health check | 200 OK |
| `GET` | `/api/health/db` | Database connectivity verification | 200 OK (or 503 if unavailable) |

### Sample Responses

#### `GET /api/health`
```json
{
  "status": "ok",
  "uptime": 14.52,
  "timestamp": "2026-10-11T17:20:00.000Z"
}
```

#### `GET /api/health/db`
```json
{
  "status": "ok",
  "database": {
    "connected": true,
    "name": "period_tracker",
    "user": "postgres",
    "server_time": "2026-10-11T17:20:00.123Z"
  }
}
```

## 6. Database Schema

The database initialization script is located at `database/schema.sql`. It defines:
- `users`: Core profile and birthday fields
- `cycle_profiles`: User cycle configurations (period length, cycle length, cycle type)
- `daily_logs`: Daily period tracking, symptoms (JSONB), mood, and notes

All table definitions use `CREATE TABLE IF NOT EXISTS` to ensure non-destructive execution.

To apply the schema manually:
```bash
psql -U postgres -d period_tracker -f database/schema.sql
```

## 7. Graceful Shutdown

The application intercepts `SIGINT` (Ctrl+C) and `SIGTERM` signals:
1. Stops accepting incoming HTTP requests (`app.close()`).
2. Closes the PostgreSQL connection pool (`pool.end()`).
3. Exits cleanly with status code 0.
