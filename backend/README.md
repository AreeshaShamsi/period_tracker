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

- **Run Automated API Test Suite**:
  ```bash
  npm run test:api
  ```

- **Run All Tests (DB connectivity + API suite)**:
  ```bash
  npm run test
  ```

## 5. API Endpoints

### System & Health
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/` | Service root message | No |
| `GET` | `/api/health` | API uptime check | No |
| `GET` | `/api/health/db` | Database connectivity verification | No |

### Authentication
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register new user + default profile transaction | No |
| `POST` | `/api/auth/login` | Log in and receive JWT token | No |
| `POST` | `/api/auth/logout` | Server-side token invalidation / logout | Yes |
| `GET` | `/api/auth/me` | Fetch authenticated user and profile | Yes |

### Profile & Onboarding
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/profile` | Get user profile and cycle stats | Yes |
| `PUT` | `/api/profile` | Update profile fields (cycle length, duration, etc.) | Yes |
| `GET` | `/api/notifications/preferences` | Notification preferences placeholder (501) | Yes |
| `PUT` | `/api/notifications/preferences` | Notification preferences placeholder (501) | Yes |

### Period Tracking
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/periods` | Create a new period record (ongoing or completed) | Yes |
| `GET` | `/api/periods` | List user periods with pagination (`page`, `limit`, `sort`) | Yes |
| `GET` | `/api/periods/:id` | Get period by ID including daily flow logs | Yes |
| `PUT` | `/api/periods/:id` | Update period dates or notes | Yes |
| `DELETE` | `/api/periods/:id` | Delete period (cascades to daily logs) | Yes |

### Daily Period Flow Logs
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/periods/:id/days` | Log daily flow (`light`, `medium`, `heavy`, `very_heavy`) | Yes |
| `GET` | `/api/periods/:id/days` | List daily flow logs for a period | Yes |
| `PUT` | `/api/periods/:id/days/:dayLogId` | Update daily flow log | Yes |
| `DELETE` | `/api/periods/:id/days/:dayLogId` | Delete daily flow log | Yes |

### Symptom Logs
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/symptoms` | Log symptom with severity (1-5) and notes | Yes |
| `GET` | `/api/symptoms` | List symptoms (filters: `start_date`, `end_date`, `symptom_type`) | Yes |
| `PUT` | `/api/symptoms/:id` | Update symptom log | Yes |
| `DELETE` | `/api/symptoms/:id` | Delete symptom log | Yes |

### Cycle & Calendar
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/cycle` | Get cycle stats, current cycle day, next period estimate | Yes |
| `GET` | `/api/calendar?month=YYYY-MM` | Month calendar view with periods, flow, symptoms, estimates | Yes |


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
