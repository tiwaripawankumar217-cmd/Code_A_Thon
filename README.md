# 🛡️ FraudGuard — Smart Budget Dashboard with ML Fraud Detection

> A full-stack personal finance dashboard that tracks income & expenses, enforces budgets, and uses **real-time AI-powered fraud detection** to flag suspicious transactions — with explainable reasons.

---

## 📖 Project Overview

FraudGuard is a web application where users can manage their personal finances while being protected by a machine learning fraud detection system running in the background. When a user adds a transaction, it is saved instantly to the database (sync path). Simultaneously, an asynchronous background job sends the transaction data to a Python ML microservice for fraud analysis. If the transaction is flagged as suspicious, a real-time toast notification slides into the user's browser — no page refresh needed.

This mirrors the architecture used by real fintech companies like Monzo, Revolut, and Chase for their internal fraud detection pipelines.

---

## ✨ Features

### 1. 🔐 User Authentication
- Secure registration and login using **Passport.js** (Local Strategy)
- Sessions persisted in MongoDB via `connect-mongo` — survives server restarts
- Each user sees only their own transactions, budgets, and alerts
- Protected routes with `isLoggedIn` middleware

### 2. 💳 Transaction Management (Full CRUD)
- Add income and expense transactions with:
  - Amount, Type (income/expense), Category, Description, Date
- View all transactions in a sortable table
- Edit or delete existing transactions
- Flagged transactions are highlighted in red with fraud reasons displayed

### 3. 📊 Smart Dashboard with Charts
- **Income vs Expense** bar chart (monthly overview)
- **Category Breakdown** pie/doughnut chart (where your money goes)
- **Financial Health Score** gauge (0–100, dynamically calculated)
- **Recent Transactions** table (last 10 entries)
- **Flagged Transactions** alert section (transactions the ML model found suspicious)
- All charts powered by **Chart.js** with data injected server-side via EJS

### 4. 💰 Budget Management & Alerts
- Set monthly spending limits per category (e.g., $200 for Groceries)
- Animated progress bars that change color as spending approaches the limit:
  - 🟢 Green (0–60%) → 🟡 Yellow (60–80%) → 🔴 Red (80–100%+)
- Configurable alert threshold (default: warn at 80% usage)
- Over-budget warnings displayed on the dashboard

### 5. 🤖 ML-Powered Fraud Detection (Async Path)
- Every new transaction triggers a background job via **Agenda** (MongoDB-backed job queue)
- The job sends the transaction to a **Python Flask** microservice running on port 5001
- The ML model analyzes the transaction and returns:
  - `isFlagged` — Boolean (is this transaction suspicious?)
  - `fraudScore` — Number between 0 and 1 (confidence level)
  - `flagReasons` — Array of human-readable explanations
- The original MongoDB document is updated with the ML results

### 6. 🧠 Explainable AI (SHAP)
- Flagged transactions don't just say "suspicious" — they explain **why**
- Example reasons:
  - _"Unusually high amount for this category"_
  - _"Large transfer detected at an unusual time"_
  - _"Spending pattern deviates from historical average"_
- Powered by **SHAP** (SHapley Additive exPlanations) for model interpretability

### 7. ⚡ Real-Time Fraud Alerts (SSE)
- Dashboard listens for fraud alerts via **Server-Sent Events** (SSE)
- When the ML model flags a transaction (2–3 seconds after submission), a toast notification slides in from the top-right corner of the screen
- No page refresh, no polling — true push-based real-time updates
- Native browser API — no Socket.io or external libraries needed

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────┐
│                   Browser (EJS)                  │
│  ┌────────────┐ ┌────────────┐ ┌──────────────┐ │
│  │ Dashboard   │ │ Add Txn    │ │ Fraud Toast  │ │
│  │ (Charts)    │ │ (Form)     │ │ (SSE)        │ │
│  └────────────┘ └─────┬──────┘ └──────▲───────┘ │
└───────────────────────┼───────────────┼──────────┘
                        │               │
              HTTP POST │               │ SSE Push
                        ▼               │
┌──────────────────────────────────────────────────┐
│              Express Server (Node.js)            │
│                                                  │
│  ┌─────────┐  ┌──────────┐  ┌─────────────────┐ │
│  │ Passport │  │ Routes   │  │ SSE Endpoint    │ │
│  │ Auth     │  │ (CRUD)   │  │ GET /stream     │ │
│  └─────────┘  └────┬─────┘  └────────▲────────┘ │
│                     │                 │          │
│          ┌──────────▼──────────┐      │          │
│          │     SYNC PATH       │      │          │
│          │  Save to MongoDB    │      │          │
│          └──────────┬──────────┘      │          │
│                     │                 │          │
│          ┌──────────▼──────────┐      │          │
│          │    ASYNC PATH       │      │          │
│          │  Agenda Job Queue   │──────┘          │
│          │  (MongoDB-backed)   │                 │
│          └──────────┬──────────┘                 │
└─────────────────────┼────────────────────────────┘
                      │
            HTTP POST │ /predict
                      ▼
┌──────────────────────────────────────────────────┐
│         Python Flask Microservice (:5001)        │
│                                                  │
│  ┌──────────────┐  ┌────────────────────────┐   │
│  │ Isolation    │  │ SHAP Explainability    │   │
│  │ Forest Model │  │ (flagReasons)          │   │
│  └──────────────┘  └────────────────────────┘   │
│                                                  │
│  Returns: { isFlagged, fraudScore, flagReasons } │
└──────────────────────────────────────────────────┘
```

### The Two Data Paths Explained

| Path | What Happens | Speed |
|------|-------------|-------|
| **Sync** | Transaction saved to MongoDB → Dashboard reflects it immediately | Instant |
| **Async** | Agenda queues a job → Job calls Flask `/predict` → MongoDB updated → SSE pushes alert | 2–3 seconds |

**Why two paths?** The user gets instant feedback (their transaction appears in the list), while the heavier ML computation runs in the background without blocking the UI. This is the same pattern used by real fintech companies.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | EJS + ejs-mate | Server-side rendered templates with shared layouts |
| **Styling** | Vanilla CSS | Dark theme, glassmorphism, responsive design |
| **Charts** | Chart.js (CDN) | Bar charts, pie charts, gauges |
| **Server** | Express.js | REST routes, middleware, SSE endpoint |
| **Authentication** | Passport.js (Local) | Username/password login with session management |
| **Sessions** | express-session + connect-mongo | Sessions persisted in MongoDB |
| **Database** | MongoDB + Mongoose | Stores users, transactions, budgets, jobs, sessions |
| **Job Queue** | Agenda | MongoDB-backed background job processing |
| **Real-time** | Server-Sent Events (SSE) | Push fraud alerts to browser without polling |
| **ML Service** | Python Flask | REST API wrapping the fraud detection model |
| **ML Model** | scikit-learn (IsolationForest) | Anomaly/outlier detection for fraud scoring |
| **Explainability** | SHAP | Human-readable reasons for why a transaction was flagged |

---

## 📦 Database Models

### User
| Field | Type | Notes |
|-------|------|-------|
| firstName | String | Required |
| lastName | String | Required |
| username | String | Auto-managed by passport-local-mongoose |
| hash | String | Auto-managed (password hash) |
| salt | String | Auto-managed (password salt) |
| overallHealthScore | Number | Cached financial health (0–100) |

### Transaction
| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId → User | Required |
| amount | Number | Required |
| type | Enum | `income` or `expense` |
| category | String | e.g., Groceries, Rent, Transfer |
| description | String | Optional |
| date | Date | Defaults to now |
| **isFlagged** | Boolean | Set by ML (default: false) |
| **fraudScore** | Number | 0–1, set by ML |
| **flagReasons** | [String] | SHAP explanations from ML |

### Budget
| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId → User | Required |
| category | String | Must match transaction categories |
| limitAmount | Number | Monthly spending cap |
| periodMonth | Number | 1–12 |
| periodYear | Number | e.g., 2026 |
| alertThreshold | Number | Default: 80 (alert at 80%) |

---

## 🎯 Demo Flow (for Judges)

1. **Register** a new account on the platform
2. **Add 3–4 normal transactions** (Groceries $50, Rent $1200, Salary $5000)
3. **Set a budget** for Groceries at $200/month
4. **Show the dashboard** — charts populate with live data, budget bars show progress
5. **Add a suspicious transaction** ($9,999 transfer to unknown)
6. **Watch the fraud alert toast** pop up in real-time ⚡ (2–3 second delay)
7. **Click the flagged transaction** — view the ML-generated reasons (SHAP explainability)
8. **Add another grocery expense** to cross the budget limit — see the over-budget warning

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/sapnilbiswas/Code_A_Thon.git
cd Code_A_Thon

# Install Node dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and session secret

# Start the Node server
npx nodemon server.js

# In a separate terminal, start the ML service
cd ml-service
pip install -r requirements.txt
python app.py
```

---

## 🏆 What Makes This Hackathon-Worthy?

1. **Two-service architecture** (Node + Python) — demonstrates system design thinking
2. **Async job processing** — not just CRUD; real background job orchestration with Agenda
3. **Explainable AI** — judges love seeing *why* an AI made a decision, not just a score
4. **Real-time push notifications** — the fraud toast during the live demo is a "wow" moment
5. **Full-stack coverage** — auth, database, charts, ML, background jobs, real-time — touches every layer of the stack

---

> **Built with ❤️ for the Hackathon by Team Code-A-Thon**
