# Bondex Backend

Bondex Backend is a TypeScript + Express CRM API focused on lead capture, lead lifecycle management, and multichannel communication workflows. It provides authenticated business operations, public lead intake, AI assistant endpoints, and admin management capabilities on top of Prisma/PostgreSQL. The project is structured in modular feature folders so each domain (auth, leads, deals, notifications, integrations) remains maintainable and easy to extend.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
	- [Health](#health)
	- [User Auth](#user-auth)
	- [Admin Auth](#admin-auth)
	- [Businesses](#businesses)
	- [Leads](#leads)
	- [Deals](#deals)
	- [Notifications](#notifications)
	- [Users Profile](#users-profile)
	- [Admin Management](#admin-management)
	- [AI](#ai)
	- [Telegram](#telegram)
	- [Gmail](#gmail)
	- [Public](#public)
- [Configuration Guide](#configuration-guide)
- [Run Guide](#run-guide)
- [Background Jobs](#background-jobs)

## Overview

This backend exposes REST APIs for CRM flows: auth, businesses, leads, deals, notifications, integrations, and public contact capture. It uses centralized validation and exception middleware patterns to keep APIs consistent and robust. AI, Telegram, and Gmail modules are integrated to support automated communication and lead operations.

## Key Features

- User registration/login with OTP and Google auth support.
- Admin 2FA login flow and protected admin management endpoints.
- Business CRUD and lead/deal lifecycle operations.
- Lead notes, status tracking, priority handling, and notification workflows.
- Public contact form endpoint storing inbound leads as `direct_chat`.
- AI module split into public/private/internal/admin scopes.
- Telegram integration (connect, webhook, reply, thread history).
- Gmail integration (status, reply, disconnect) plus background lead polling.

## Tech Stack
- Runtime: Node.js, TypeScript, Express
- Database: PostgreSQL + Prisma ORM
- Validation: Zod
- Auth: JWT + cookie-based flows
- AI: Gemini (`@google/generative-ai`)
- Integrations: Telegram Bot API, Google APIs (Gmail)

## Project Structure

```bash
bondex_backend/
├── .env
├── .git/
├── .gitignore
├── LICENSE
├── node_modules/
├── package-lock.json
├── package.json
├── prisma.config.ts
├── README.md
├── SECURITY.md
├── tsconfig.json
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│       ├── migration_lock.toml
│       ├── 20260406114641_init/
│       ├── 20260407133000_sync_auth_schema/
│       ├── 20260407134000_sync_auth_schema_fix/
│       ├── 20260407135000_reconcile_schema/
│       └── 20260407190032_add_manual_lead_platform/
└── src/
		├── index.ts
		├── config/
		│   ├── ai.config.ts
		│   ├── app.config.ts
		│   ├── auth.config.ts
		│   ├── email.config.ts
		│   ├── env.config.ts
		│   ├── gmail.config.ts
		│   ├── jwt.config.ts
		│   ├── prisma.ts
		│   ├── telegram.config.ts
		│   └── webhook.config.ts
		├── constants/
		│   ├── business.constant.ts
		│   ├── deal.constant.ts
		│   ├── gmail.constant.ts
		│   ├── jwt.constant.ts
		│   ├── leadstatus.constant.ts
		│   ├── messages.constant.ts
		│   ├── otp.constant.ts
		│   ├── roles.constant.ts
		│   └── telegram.constant.ts
		├── exceptions/
		│   ├── api.exception.ts
		│   ├── base.exception.ts
		│   └── validation.exception.ts
		├── generated/
		│   └── prisma/
		│       ├── browser.ts
		│       ├── client.ts
		│       ├── commonInputTypes.ts
		│       ├── enums.ts
		│       ├── models.ts
		│       ├── internal/
		│       └── models/
		├── middlewares/
		│   ├── auth.middleware.ts
		│   ├── authorize.middleware.ts
		│   ├── error.middleware.ts
		│   ├── rateLimit.middleware.ts
		│   └── validate.middleware.ts
		├── modules/
		│   ├── admin/
		│   │   ├── admin.controller.ts
		│   │   ├── admin.route.ts
		│   │   ├── admin.service.ts
		│   │   ├── admin.types.ts
		│   │   └── admin.validation.ts
		│   ├── ai/
		│   │   ├── ai.route.ts
		│   │   ├── core.ai.service.ts
		│   │   ├── admin/
		│   │   │   ├── admin.ai.controller.ts
		│   │   │   ├── admin.ai.service.ts
		│   │   │   └── admin.prompts.ts
		│   │   ├── internal/
		│   │   │   ├── internal.ai.controller.ts
		│   │   │   ├── internal.ai.service.ts
		│   │   │   └── internal.prompts.ts
		│   │   ├── private/
		│   │   │   ├── private.ai.controller.ts
		│   │   │   ├── private.ai.service.ts
		│   │   │   └── private.prompts.ts
		│   │   └── public/
		│   │       ├── public.ai.controller.ts
		│   │       ├── public.ai.service.ts
		│   │       └── public.prompts.ts
		│   ├── auth/
		│   │   ├── admin/
		│   │   │   └── login/
		│   │   │       ├── admin.auth.types.ts
		│   │   │       ├── admin.auth.validation.ts
		│   │   │       ├── admin.login.route.ts
		│   │   │       ├── admin.login.service.ts
		│   │   │       ├── admin.logout.controller.ts
		│   │   │       ├── admin.logout.route.ts
		│   │   │       ├── admin.logout.service.ts
		│   │   │       ├── adminlogin.controller.ts
		│   │   │       ├── verifyadminOTP.controller.ts
		│   │   │       ├── verifyadminOTP.route.ts
		│   │   │       └── verifyadminOTP.services.ts
		│   │   └── users/
		│   │       ├── auth.types.ts
		│   │       ├── auth.validation.ts
		│   │       ├── user.route.ts
		│   │       ├── verifyOTP.services.ts
		│   │       ├── login/
		│   │       │   ├── forgotpassword.services.ts
		│   │       │   ├── login.controller.ts
		│   │       │   ├── login.route.ts
		│   │       │   ├── login.services.ts
		│   │       │   └── resetPassword.services.ts
		│   │       └── register/
		│   │           ├── google.signup.controller.ts
		│   │           ├── google.signup.services.ts
		│   │           ├── register.route.ts
		│   │           ├── register.services.ts
		│   │           ├── resgister.controller.ts
		│   │           └── verifyOTP.controller.ts
		│   ├── business/
		│   │   ├── business.controller.ts
		│   │   ├── business.route.ts
		│   │   ├── business.service.ts
		│   │   ├── business.types.ts
		│   │   └── business.validation.ts
		│   ├── deals/
		│   │   ├── deal.controller.ts
		│   │   ├── deal.route.ts
		│   │   ├── deal.service.ts
		│   │   ├── deal.types.ts
		│   │   └── deal.validation.ts
		│   ├── gmail/
		│   │   ├── gmail.controller.ts
		│   │   ├── gmail.route.ts
		│   │   ├── gmail.service.ts
		│   │   ├── gmail.types.ts
		│   │   └── gmail.validation.ts
		│   ├── leads/
		│   │   ├── lead.controller.ts
		│   │   ├── lead.route.ts
		│   │   ├── lead.service.ts
		│   │   ├── lead.types.ts
		│   │   ├── lead.validation.ts
		│   │   └── notes/
		│   │       └── note.service.ts
		│   ├── notifications/
		│   │   ├── notification.controller.ts
		│   │   ├── notification.route.ts
		│   │   ├── notification.service.ts
		│   │   ├── notification.types.ts
		│   │   ├── notification.validation.ts
		│   │   ├── appNotification/
		│   │   │   └── app.notification.service.ts
		│   │   └── emailNotification/
		│   │       └── email.notification.service.ts
		│   ├── public/
		│   │   ├── public.controller.ts
		│   │   ├── public.route.ts
		│   │   ├── public.service.ts
		│   │   ├── public.types.ts
		│   │   └── public.validation.ts
		│   ├── telegram/
		│   │   ├── telegram.controller.ts
		│   │   ├── telegram.handler.ts
		│   │   ├── telegram.route.ts
		│   │   ├── telegram.service.ts
		│   │   ├── telegram.types.ts
		│   │   └── telegram.validation.ts
		│   └── users/
		│       ├── user.controller.ts
		│       ├── user.route.ts
		│       ├── user.service.ts
		│       ├── user.types.ts
		│       └── user.validation.ts
		├── types/
		│   ├── auth.types.ts
		│   ├── global.types.ts
		│   ├── gmail.types.ts
		│   ├── jwt.types.ts
		│   ├── otp.types.ts
		│   └── telegram.types.ts
		└── utils/
				├── ai.util.ts
				├── asyncHandler.ts
				├── email.util.ts
				├── gmail.util.ts
				├── jwt.util.ts
				├── logger.ts
				├── otp.util.ts
				├── password.util.ts
				└── jwt/
						├── jwt.cookie.ts
						├── jwt.create.ts
						└── jwt.verify.ts
```

## API Endpoints

Base URL example: `http://localhost:7000`

### Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | No | API health check |

### User Auth

Base: `/api/auth/user`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Register user |
| POST | `/register/verify-otp` | No | Verify registration OTP |
| POST | `/register/google-signup` | No | Signup with Google |
| POST | `/login` | No | User login |
| POST | `/login/google` | No | Login with Google |
| POST | `/login/forgot-password` | No | Request reset OTP |
| POST | `/login/verify-reset-otp` | No | Verify reset OTP |
| POST | `/login/reset-password` | No | Reset password |
| POST | `/logout` | User | Logout user |

### Admin Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/admin/auth/login` | No | Admin login step 1 |
| POST | `/api/admin/auth/verify-otp` | No | Admin login OTP verification |
| POST | `/api/admin/auth/logout` | Admin | Admin logout |

### Businesses

Base: `/api/businesses` (all routes require User auth)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | User | Create business |
| GET | `/` | User | List owner businesses |
| GET | `/:businessId` | User | Get business details |
| PATCH | `/:businessId` | User | Update business |
| DELETE | `/:businessId` | User | Delete business |

### Leads

Base: `/api/leads` (all routes require User auth)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | User | Create lead |
| GET | `/` | User | List leads |
| GET | `/:leadId` | User | Get lead details |
| PUT | `/:leadId` | User | Update lead |
| DELETE | `/:leadId` | User | Delete lead |
| GET | `/:leadId/notes` | User | List lead notes |
| POST | `/:leadId/notes` | User | Create lead note |
| PUT | `/:leadId/notes/:noteId` | User | Update lead note |

### Deals

Base: `/api/deals` (all routes require User auth)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/convert` | User | Convert lead to deal |
| GET | `/` | User | List deals |
| PUT | `/:dealId/stage` | User | Update deal stage |

### Notifications

Base: `/api/notifications` (all routes require User auth)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/unread-count` | User | Get unread count |
| GET | `/` | User | List notifications |
| PATCH | `/:notificationId/read` | User | Mark as read |

### Users Profile

Base: `/api/users` (all routes require User auth)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/profile` | User | Get profile |
| PUT | `/profile` | User | Update profile |
| GET | `/stats` | User | Get user stats |
| POST | `/email/request` | User | Request email change OTP |
| PUT | `/email/confirm` | User | Confirm email change OTP |

### Admin Management

Base: `/api/admin` (all routes require Admin auth)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/users` | Admin | List users |
| GET | `/users/:userId` | Admin | Get user details |
| PATCH | `/users/:userId/block` | Admin | Block user |
| PATCH | `/users/:userId/unblock` | Admin | Unblock user |
| DELETE | `/users/:userId` | Admin | Delete user |
| GET | `/stats/system` | Admin | System stats |

### AI

Base: `/api/ai`

#### Public AI

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/public/welcome-bot` | No | Generate welcome bot message |
| POST | `/public/bondex-overview` | No | Generate product overview |
| POST | `/public/features-summary` | No | Generate features summary |
| POST | `/public/how-it-works` | No | Generate workflow explanation |
| POST | `/public/value-proposition` | No | Generate value proposition |

#### Internal AI

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/internal/priority-scoring` | No | Score lead priority |
| POST | `/internal/sentiment-analysis` | No | Analyze sentiment |
| POST | `/internal/extract-contact-info` | No | Extract contact info |

#### Private AI

All `/private/*` endpoints require User auth.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/private/quick-tour` | User | Quick product tour message |
| POST | `/private/getting-started` | User | Getting-started guidance |
| POST | `/private/no-leads-yet` | User | No-leads assistance message |
| POST | `/private/daily-check-in` | User | Daily check-in text |
| POST | `/private/explain-message` | User | Explain customer message |
| POST | `/private/suggest-reply` | User | Suggest reply draft |
| POST | `/private/lead-summary` | User | Summarize lead context |
| POST | `/private/follow-up-reminder` | User | Follow-up reminder text |
| POST | `/private/help-message` | User | Helper prompt |

#### Admin AI

All `/admin/*` endpoints require Admin auth.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/admin/system-overview` | Admin | System overview summary |
| POST | `/admin/ai-performance-summary` | Admin | AI performance summary |
| POST | `/admin/alert-configuration-guide` | Admin | Alert setup guidance |
| POST | `/admin/data-monitoring` | Admin | Monitoring guidance |
| POST | `/admin/daily-summary` | Admin | Daily AI/admin summary |
| POST | `/admin/weekly-summary` | Admin | Weekly AI/admin summary |
| POST | `/admin/system-performance-overview` | Admin | Performance overview |

### Telegram

Base: `/api/telegram`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/webhook/:businessId` | No (webhook) | Telegram webhook receiver |
| POST | `/connect` | User | Connect Telegram bot |
| POST | `/disconnect` | User | Disconnect Telegram bot |
| POST | `/reply` | User | Reply to Telegram lead |
| GET | `/leads/:leadId/thread` | User | Get Telegram chat thread |

### Gmail

Base: `/api/gmail` (all routes require User auth)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/status/:businessId` | User | Get Gmail connection status |
| POST | `/disconnect` | User | Disconnect Gmail |
| POST | `/reply` | User | Reply on Gmail thread |

### Public

Base: `/api/public` (no auth)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/businesses` | No | Public business list |
| GET | `/businesses/:id` | No | Public business details |
| POST | `/contact` | No | Submit contact lead (`direct_chat`) |

## Configuration Guide

Create a `.env` file in `bondex_backend/` and set these values.

### Required Environment Variables

| Variable | Required | Example |
|---|---|---|
| `NODE_ENV` | Yes | `development` |
| `PORT` | Yes | `7000` |
| `CLIENT_URL` | Yes | `http://localhost:3000` |
| `FRONTEND_URL` | Optional | `http://localhost:3000` |
| `DATABASE_URL` | Yes | `postgresql://user:pass@localhost:5432/bondex` |
| `GOOGLE_CLIENT_ID` | Yes | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Yes | `xxxxx` |
| `GOOGLE_REDIRECT_URI` | Yes | `http://localhost:7000/auth/google/callback` |
| `SMTP_HOST` | Yes | `smtp.gmail.com` |
| `SMTP_PORT` | Yes | `587` |
| `SMTP_USER` | Yes | `noreply@yourdomain.com` |
| `SMTP_PASS` | Yes | `smtp-password` |
| `SMTP_FROM_EMAIL` | Yes | `noreply@yourdomain.com` |
| `SMTP_FROM_NAME` | Yes | `Bondex CRM` |
| `GMAIL_REFRESH_TOKEN` | Yes | `1//0g...` |
| `TELEGRAM_BOT_TOKEN` | Yes | `123456:ABC-DEF...` |
| `GEMINI_API_KEY` | Yes | `AIza...` |
| `JWT_SECRET` | Yes | `super-secret` |
| `JWT_ACCESS_SECRET` | Optional | `super-secret-access` |
| `JWT_REFRESH_SECRET` | Optional | `super-secret-refresh` |
| `JWT_ACCESS_EXPIRES_IN` | Optional | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Optional | `7d` |
| `JWT_COOKIE_HTTP_ONLY` | Optional | `true` |
| `TELEGRAM_WEBHOOK_ENABLED` | Optional | `false` |
| `TELEGRAM_WEBHOOK_PATH` | Optional | `/webhooks/telegram` |
| `TELEGRAM_WEBHOOK_SECRET` | Optional | `secret-value` |
| `TELEGRAM_WEBHOOK_BASE_URL` | Optional | `https://your-domain.com` |

### Minimal `.env` Template

```bash
NODE_ENV=development
PORT=7000
CLIENT_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bondex

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM_EMAIL=
SMTP_FROM_NAME=Bondex CRM

GMAIL_REFRESH_TOKEN=
TELEGRAM_BOT_TOKEN=
GEMINI_API_KEY=

JWT_SECRET=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_COOKIE_HTTP_ONLY=true

TELEGRAM_WEBHOOK_ENABLED=false
TELEGRAM_WEBHOOK_PATH=/webhooks/telegram
TELEGRAM_WEBHOOK_SECRET=
TELEGRAM_WEBHOOK_BASE_URL=
```

## Run Guide

```bash
# 1) Install dependencies
npm install

# 2) Generate Prisma client
npx prisma generate

# 3) Run migrations
npx prisma migrate dev

# 4) Start dev server
npm run dev
```

Server default: `http://localhost:7000`

## Background Jobs

The backend starts these background workers on boot:

- Stale high-priority lead monitor (`startStaleHighPriorityLeadMonitor`).
- Gmail lead polling loop (`startGmailLeadPolling`).
