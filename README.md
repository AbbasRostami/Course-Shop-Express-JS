<div align="center">

  <img src="https://expressjs.com/images/logos/logo-express-black.svg" width="350" alt="Express Logo" />
  
<h1>🎓 Course Shop API</h1>

<p>
  <strong>A production-ready backend for modern learning platforms.</strong>
  <br/>
</p>

  <p><strong>A full-featured RESTful backend for an online educational platform with e-commerce, wallet, and blog capabilities.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
    <img src="https://img.shields.io/badge/Zod-3068B7?style=for-the-badge&logo=zod&logoColor=white" alt="Zod" />
    <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary" />
    <img src="https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" alt="Swagger" />
    <img src="https://img.shields.io/badge/Winston-231F20?style=for-the-badge" alt="Winston" />
    <img src="https://img.shields.io/badge/Telegram_Bot-26A5E4?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram Bot" />
    <img src="https://img.shields.io/badge/Nodemailer-339933?style=for-the-badge" alt="Nodemailer" />
    <img src="https://img.shields.io/badge/Zarinpal-F9A825?style=for-the-badge" alt="Zarinpal" />
    <img src="https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest" />
  </p>

</div>

---

## 📋 Table of Contents

- [🎯 About](#-about)
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📋 Prerequisites](#-prerequisites)
- [🚀 Getting Started](#-getting-started)
- [📁 Project Structure](#-project-structure)
- [📊 API Documentation](#-api-documentation)
- [🔐 Authentication](#-authentication)
- [🌐 Environment Variables](#-environment-variables)
- [📝 Scripts](#-scripts)
- [🤝 Contributing](#-contributing)

---

## 🎯 About

**Course Shop API** is a production-ready backend server for a full-stack educational e-commerce platform. It handles everything from user authentication and course management to payment processing, blog posts, and real-time admin notifications — all built with a clean modular architecture on top of Express 5 and TypeScript.

The platform is designed for two types of users: **students** who browse, purchase, and enroll in courses, and **administrators** who manage content, users, discounts, and monitor platform analytics.

---

## ✨ Features

- ✅ 🔐 **Authentication & Authorization** — Dual-mode JWT (Bearer token + HttpOnly cookies), email verification, forgot/reset password, change email & password flows
- ✅ 👤 **User Management** — Profile with avatar upload, admin ban/unban system, role-based access control (`USER` / `ADMIN` / `SUPER_ADMIN`)
- ✅ 🎓 **Course Management** — Full CRUD for courses with image upload, slugs, levels, category & teacher associations, publish/unpublish toggle
- ✅ 🗂️ **Category System** — Hierarchical categories with visibility toggle, linked to both courses and blog posts
- ✅ 👨‍🏫 **Teacher Profiles** — Create and manage instructor profiles with avatar, bio, and slug
- ✅ 🛒 **Shopping Cart** — Persistent cart per user, add/remove courses, apply/remove discount codes
- ✅ 💳 **Order & Checkout** — Checkout via Zarinpal payment gateway or wallet balance, order history, cancellation
- ✅ 💰 **Wallet System** — Charge wallet via Zarinpal, track balance, full transaction history
- ✅ 🎟️ **Discount Codes** — Percentage and fixed-amount discounts, usage limits, expiry dates, admin toggle
- ✅ 📚 **Enrollments** — Free or paid course enrollment, access to enrolled courses
- ✅ 📝 **Blog Posts** — Full CRUD for posts with image upload, slug routing, publish/unpublish
- ✅ 💬 **Comments** — Nested comments on courses and posts, moderation (approve/reject), user's own comment management
- ✅ 👍 **Reactions** — Like/Dislike reactions on courses, posts, and comments
- ✅ ❤️ **Favorites** — Bookmark courses and blog posts
- ✅ 🔍 **Global Search** — Cross-entity search across courses and posts
- ✅ 📊 **Admin Dashboard Stats** — Overview and per-entity stats (users, courses, orders, revenue, discounts, comments, posts, enrollments)
- ✅ 🖼️ **File Uploads** — Cloudinary-powered image uploads for avatars, courses, posts, teachers, and rich-text editor images
- ✅ 📧 **Email System** — Gmail OAuth2 API (primary) with SMTP fallback via Nodemailer — for verification, password reset, and email change
- ✅ 🤖 **Telegram Notifications** — Real-time error alerts with stack traces, request context, user info, and device details sent to a Telegram bot
- ✅ 🛡️ **Security** — Helmet, CORS with allowlist, global + per-route rate limiting, input sanitization via sanitize-html, Zod schema validation
- ✅ 📖 **API Docs** — Full Swagger/OpenAPI 3.0 documentation at `/api-docs`
- ✅ 📝 **Logging** — Winston with console + file transports (`logs/combined.log`, `logs/error.log`)
- ✅ ⚡ **Graceful Shutdown** — SIGTERM/SIGINT handlers with proper DB disconnection

---

## 🛠️ Tech Stack

| Category          | Technology                         | Purpose                                 |
| ----------------- | ---------------------------------- | --------------------------------------- |
| Runtime           | Node.js ≥ 20                       | JavaScript runtime                      |
| Language          | TypeScript 6                       | Type-safe development                   |
| Framework         | Express 5                          | HTTP server & routing                   |
| Database          | PostgreSQL (Neon)                  | Primary relational database             |
| ORM               | Prisma 7                           | Type-safe database access & migrations  |
| Authentication    | JSON Web Tokens                    | Access & refresh token auth             |
| Validation        | Zod 4                              | Schema validation for all inputs        |
| Password Hashing  | bcrypt                             | Secure password storage                 |
| File Storage      | Cloudinary                         | Cloud image storage & transformation    |
| File Upload       | Multer + multer-storage-cloudinary | Multipart form handling                 |
| Email             | Nodemailer + Gmail OAuth2          | Transactional email delivery            |
| Payment Gateway   | Zarinpal                           | Iranian payment processing              |
| Logging           | Winston                            | Multi-transport structured logging      |
| Error Alerts      | Telegram Bot API                   | Real-time server error notifications    |
| API Documentation | Swagger UI + swagger-jsdoc         | Interactive API explorer                |
| Security          | Helmet + CORS + express-rate-limit | HTTP security headers & rate limiting   |
| HTML Sanitization | sanitize-html                      | XSS prevention on user content          |
| Testing           | Vitest + Supertest                 | Unit and integration tests              |
| Package Manager   | pnpm 10                            | Fast, disk-efficient package management |

---

## 📋 Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** `>= 20.0.0`
- **pnpm** `>= 10.0.0` — install with `npm install -g pnpm`
- **PostgreSQL** `>= 14` (or a [Neon](https://neon.tech) cloud database)
- A **Cloudinary** account for image uploads
- A **Gmail** account with OAuth2 credentials (or app password for SMTP fallback)
- A **Telegram Bot** token (optional, for error notifications)
- A **Zarinpal** merchant ID (optional, for payment gateway)

---

## 🚀 Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/your-username/course-shop-api.git
cd course-shop-api

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your actual values

# 4. Generate Prisma client
pnpm run build

# 5. Run database migrations
pnpm exec prisma migrate deploy

# 6. Start the development server
pnpm run dev
```

The server will start on `http://localhost:3000`.
API documentation is available at `http://localhost:3000/api-docs`.

> 💡 **Tip:** Run `pnpm exec prisma studio` to explore your database visually in the browser.

> ⚠️ **Warning:** Never commit your `.env` file. It contains secrets like JWT keys, DB credentials, and API tokens.

---

## 📁 Project Structure

```
course-shop-api/
│
├── src/
│   ├── app.ts                          # Express app setup, middleware, route mounting
│   ├── server.ts                       # Server entry point, graceful shutdown
│   │
│   ├── config/
│   │   ├── cloudinary.ts               # Cloudinary SDK configuration
│   │   ├── multer.ts                   # Multer storage configs (avatar, course, post, teacher, editor)
│   │   └── swagger.ts                  # OpenAPI 3.0 spec assembly
│   │
│   ├── lib/
│   │   └── prisma.ts                   # Prisma client singleton
│   │
│   ├── middlewares/
│   │   ├── authentication.ts           # JWT verification (Bearer + Cookie)
│   │   ├── authLimiter.ts              # Per-route rate limiters for auth endpoints
│   │   ├── authorization.ts            # Role-based access control (ADMIN/USER/SUPER_ADMIN)
│   │   ├── errorHandler.ts             # Global error handler + Telegram alerts
│   │   ├── logger.ts                   # Winston logger + Telegram error formatter
│   │   └── validate.ts                 # Zod schema validation middleware
│   │
│   ├── types/                          # Global TypeScript type augmentations
│   │
│   ├── utils/
│   │   ├── AppError.ts                 # Custom error class
│   │   ├── asyncHandler.ts             # Async route error wrapper
│   │   ├── cloudinary.ts               # Cloudinary upload/delete helpers
│   │   ├── courseAccess.ts             # Enrollment access check helper
│   │   ├── email.ts                    # Email sender (Gmail OAuth2 + SMTP fallback)
│   │   ├── getUserIdFromRequest.ts     # Extract user ID from request
│   │   ├── jwt.ts                      # JWT sign/verify utilities
│   │   ├── pagination.ts               # Pagination helper
│   │   ├── password.ts                 # bcrypt hash/compare helpers
│   │   ├── reactionHelper.ts           # Generic reaction toggle logic
│   │   ├── sanitizeHtml.ts             # HTML sanitization wrapper
│   │   ├── slug.ts                     # Slug generation utility
│   │   └── zarinpal.ts                 # Zarinpal payment request/verify
│   │
│   ├── modules/
│   │   ├── auth/                       # Registration, login, email verification, password reset, email change
│   │   ├── cart/                       # Shopping cart + discount application
│   │   ├── category/                   # Course & post categories with visibility toggle
│   │   ├── comment/                    # Nested comments on courses & posts, moderation
│   │   ├── course/                     # Course CRUD, publish toggle, reactions
│   │   ├── discount/                   # Discount code management (admin)
│   │   ├── enrollment/                 # Course enrollment & my courses
│   │   ├── favorite/                   # Course & post bookmarks
│   │   ├── health/                     # Health check & ping endpoints
│   │   ├── order/                      # Order checkout (wallet/zarinpal), history, cancellation
│   │   ├── overview/                   # Admin analytics & statistics dashboard
│   │   ├── post/                       # Blog post CRUD, publish toggle, reactions
│   │   ├── reaction/                   # Like/Dislike on courses, posts, comments
│   │   ├── search/                     # Global search across courses and posts
│   │   ├── teacher/                    # Teacher profile CRUD
│   │   ├── upload/                     # Rich-text editor image upload
│   │   ├── user/                       # User profile, avatar, admin user management
│   │   └── wallet/                     # Wallet balance, charge, transaction history
│   │
│   └── __tests__/                      # Vitest integration tests
│
├── prisma/
│   ├── schema.prisma                   # Database schema (models, enums, relations)
│   └── migrations/                     # Migration history (11 migrations)
│
├── generated/
│   └── prisma/                         # Auto-generated Prisma client
│
├── logs/
│   ├── combined.log                    # All log entries
│   └── error.log                       # Error-level log entries
│
├── .env                                # Environment variables (do not commit)
├── .gitignore
├── package.json
├── pnpm-lock.yaml
├── prisma.config.ts
└── README.md
```

Each module follows a consistent structure:

```
modules/<name>/
├── <name>.controller.ts    # Request handlers (thin layer, delegates to service)
├── <name>.routes.ts        # Express Router with middleware chain
├── <name>.service.ts       # Business logic and Prisma queries
├── <name>.swagger.ts       # OpenAPI path definitions for this module
├── <name>.validator.ts     # Zod schemas for request validation
└── <name>.types.ts         # TypeScript interfaces/types (where applicable)
```

---

## 📊 API Documentation

Interactive API documentation is available via Swagger UI:

- **Development:** `http://localhost:3000/api-docs`
- **Production:** `https://your-domain.com/api-docs`
- **JSON:** `https://your-domain.com/swagger.json`

All endpoints are documented with request schemas, response examples, and authentication requirements. The Swagger UI supports persistent authorization — log in once and all protected requests will automatically include your token.

---

### 🏥 Health Module

| Method | Endpoint       | Description                      | Auth Required |
| ------ | -------------- | -------------------------------- | :-----------: |
| `GET`  | `/health`      | Full health check with DB status |      ❌       |
| `HEAD` | `/health`      | Lightweight availability check   |      ❌       |
| `GET`  | `/health/ping` | Simple ping response             |      ❌       |

---

### 🔐 Auth Module

| Method | Endpoint                             | Description                                  | Auth Required |
| ------ | ------------------------------------ | -------------------------------------------- | :-----------: |
| `POST` | `/api/auth/register`                 | Register a new user (rate-limited)           |      ❌       |
| `POST` | `/api/auth/verify-email`             | Verify email with code                       |      ❌       |
| `POST` | `/api/auth/login`                    | Login and receive tokens (rate-limited)      |      ❌       |
| `POST` | `/api/auth/refresh`                  | Refresh access token using refresh token     |      ❌       |
| `POST` | `/api/auth/logout`                   | Logout and clear tokens                      |      ❌       |
| `POST` | `/api/auth/forgot-password`          | Request password reset code (rate-limited)   |      ❌       |
| `POST` | `/api/auth/reset-password`           | Reset password with code (rate-limited)      |      ❌       |
| `POST` | `/api/auth/resend-verification`      | Resend email verification code               |      ❌       |
| `POST` | `/api/auth/resend-reset-code`        | Resend password reset code                   |      ❌       |
| `POST` | `/api/auth/change-password`          | Change password (must know current password) |    ✅ User    |
| `POST` | `/api/auth/request-change-email`     | Request email change with verification code  |    ✅ User    |
| `POST` | `/api/auth/verify-change-email`      | Confirm email change with code               |    ✅ User    |
| `POST` | `/api/auth/resend-change-email-code` | Resend email change verification code        |    ✅ User    |

---

### 👤 User Module

| Method   | Endpoint                      | Description                                 | Auth Required |
| -------- | ----------------------------- | ------------------------------------------- | :-----------: |
| `GET`    | `/api/users/profile`          | Get own profile                             |    ✅ User    |
| `GET`    | `/api/users/profile/overview` | Get own profile with stats overview         |    ✅ User    |
| `PUT`    | `/api/users/profile`          | Update profile (name, phone, avatar upload) |    ✅ User    |
| `DELETE` | `/api/users/profile/avatar`   | Delete own avatar                           |    ✅ User    |
| `GET`    | `/api/users`                  | List all users (paginated, filterable)      |   ✅ Admin    |
| `GET`    | `/api/users/blacklist`        | List all banned users                       |   ✅ Admin    |
| `GET`    | `/api/users/:id`              | Get user by ID                              |   ✅ Admin    |
| `POST`   | `/api/users/:id/ban`          | Ban a user                                  |   ✅ Admin    |
| `DELETE` | `/api/users/:id/ban`          | Unban a user                                |   ✅ Admin    |

---

### 🗂️ Category Module

| Method   | Endpoint                         | Description                             | Auth Required |
| -------- | -------------------------------- | --------------------------------------- | :-----------: |
| `GET`    | `/api/categories`                | List all visible categories             |      ❌       |
| `GET`    | `/api/categories/:slug`          | Get category by slug with courses/posts |      ❌       |
| `GET`    | `/api/categories/admin`          | List all categories (including hidden)  |   ✅ Admin    |
| `POST`   | `/api/categories`                | Create a new category                   |   ✅ Admin    |
| `PUT`    | `/api/categories/:id`            | Update a category                       |   ✅ Admin    |
| `DELETE` | `/api/categories/:id`            | Delete a category                       |   ✅ Admin    |
| `PATCH`  | `/api/categories/:id/visibility` | Toggle category visibility              |   ✅ Admin    |

---

### 👨‍🏫 Teacher Module

| Method   | Endpoint              | Description                         | Auth Required |
| -------- | --------------------- | ----------------------------------- | :-----------: |
| `GET`    | `/api/teachers`       | List all teachers                   |      ❌       |
| `GET`    | `/api/teachers/:slug` | Get teacher profile by slug         |      ❌       |
| `POST`   | `/api/teachers`       | Create teacher (with avatar upload) |   ✅ Admin    |
| `PUT`    | `/api/teachers/:id`   | Update teacher (with avatar upload) |   ✅ Admin    |
| `DELETE` | `/api/teachers/:id`   | Delete teacher                      |   ✅ Admin    |

---

### 🎓 Course Module

| Method   | Endpoint                    | Description                                    | Auth Required |
| -------- | --------------------------- | ---------------------------------------------- | :-----------: |
| `GET`    | `/api/courses`              | List published courses (filterable, paginated) |      ❌       |
| `GET`    | `/api/courses/:slug`        | Get course details by slug                     |      ❌       |
| `GET`    | `/api/courses/admin`        | List all courses including unpublished         |   ✅ Admin    |
| `POST`   | `/api/courses`              | Create course (with image upload)              |   ✅ Admin    |
| `PUT`    | `/api/courses/:id`          | Update course (with image upload)              |   ✅ Admin    |
| `DELETE` | `/api/courses/:id`          | Delete course                                  |   ✅ Admin    |
| `PATCH`  | `/api/courses/:id/publish`  | Toggle course publish status                   |   ✅ Admin    |
| `POST`   | `/api/courses/:id/reaction` | Like or dislike a course                       |    ✅ User    |

---

### 📚 Enrollment Module

| Method | Endpoint                      | Description                 | Auth Required |
| ------ | ----------------------------- | --------------------------- | :-----------: |
| `GET`  | `/api/enrollments/my-courses` | Get user's enrolled courses |    ✅ User    |
| `POST` | `/api/enrollments/:slug`      | Enroll in a course by slug  |    ✅ User    |

---

### 🛒 Cart Module

| Method   | Endpoint                    | Description                            | Auth Required |
| -------- | --------------------------- | -------------------------------------- | :-----------: |
| `GET`    | `/api/cart`                 | Get current cart with items and totals |    ✅ User    |
| `POST`   | `/api/cart/items`           | Add a course to cart                   |    ✅ User    |
| `DELETE` | `/api/cart/items/:courseId` | Remove a course from cart              |    ✅ User    |
| `DELETE` | `/api/cart`                 | Clear entire cart                      |    ✅ User    |
| `POST`   | `/api/cart/apply-discount`  | Apply a discount code to cart          |    ✅ User    |
| `DELETE` | `/api/cart/discount`        | Remove applied discount from cart      |    ✅ User    |

---

### 📦 Order Module

| Method  | Endpoint                          | Description                             | Auth Required |
| ------- | --------------------------------- | --------------------------------------- | :-----------: |
| `GET`   | `/api/orders/verify`              | Verify payment after Zarinpal redirect  |      ❌       |
| `GET`   | `/api/orders/my-orders`           | Get user's order history                |    ✅ User    |
| `POST`  | `/api/orders/checkout/wallet`     | Checkout using wallet balance           |    ✅ User    |
| `POST`  | `/api/orders/checkout/zarinpal`   | Checkout using Zarinpal payment gateway |    ✅ User    |
| `GET`   | `/api/orders/:id`                 | Get order details by ID                 |    ✅ User    |
| `PATCH` | `/api/orders/:id/cancel`          | Cancel own pending order                |    ✅ User    |
| `GET`   | `/api/orders/admin`               | List all orders (paginated, filterable) |   ✅ Admin    |
| `GET`   | `/api/orders/admin/:id`           | Get any order details by ID             |   ✅ Admin    |
| `PATCH` | `/api/orders/admin/:id/cancel`    | Cancel any pending order                |   ✅ Admin    |

---

### 💰 Wallet Module

| Method | Endpoint                         | Description                         | Auth Required |
| ------ | -------------------------------- | ----------------------------------- | :-----------: |
| `GET`  | `/api/wallet`                    | Get wallet balance                  |    ✅ User    |
| `POST` | `/api/wallet/charge`             | Initiate wallet charge via Zarinpal |    ✅ User    |
| `GET`  | `/api/wallet/verify`             | Verify wallet charge after redirect |      ❌       |
| `GET`  | `/api/wallet/transactions`       | Get own transaction history         |    ✅ User    |
| `GET`  | `/api/wallet/admin/wallets`      | List all user wallets               |   ✅ Admin    |
| `GET`  | `/api/wallet/admin/transactions` | List all transactions               |   ✅ Admin    |

---

### 🎟️ Discount Module

| Method   | Endpoint                    | Description                   | Auth Required |
| -------- | --------------------------- | ----------------------------- | :-----------: |
| `GET`    | `/api/discounts`            | List all discount codes       |   ✅ Admin    |
| `POST`   | `/api/discounts`            | Create a discount code        |   ✅ Admin    |
| `PATCH`  | `/api/discounts/:id/toggle` | Toggle discount active status |   ✅ Admin    |
| `DELETE` | `/api/discounts/:id`        | Delete a discount code        |   ✅ Admin    |

---

### 📝 Post Module

| Method   | Endpoint                  | Description                      | Auth Required |
| -------- | ------------------------- | -------------------------------- | :-----------: |
| `GET`    | `/api/posts`              | List published posts (paginated) |      ❌       |
| `GET`    | `/api/posts/:slug`        | Get post by slug                 |      ❌       |
| `GET`    | `/api/posts/admin`        | List all posts including drafts  |   ✅ Admin    |
| `POST`   | `/api/posts`              | Create post (with image upload)  |   ✅ Admin    |
| `PUT`    | `/api/posts/:id`          | Update post (with image upload)  |   ✅ Admin    |
| `DELETE` | `/api/posts/:id`          | Delete post                      |   ✅ Admin    |
| `PATCH`  | `/api/posts/:id/publish`  | Toggle post publish status       |   ✅ Admin    |
| `POST`   | `/api/posts/:id/reaction` | Like or dislike a post           |    ✅ User    |

---

### 💬 Comment Module

| Method   | Endpoint                     | Description                        | Auth Required |
| -------- | ---------------------------- | ---------------------------------- | :-----------: |
| `GET`    | `/api/comments/course/:slug` | Get approved comments for a course |      ❌       |
| `GET`    | `/api/comments/post/:slug`   | Get approved comments for a post   |      ❌       |
| `POST`   | `/api/comments`              | Create a comment (or reply)        |    ✅ User    |
| `GET`    | `/api/comments/my-comments`  | Get own comments                   |    ✅ User    |
| `DELETE` | `/api/comments/:id`          | Delete own comment                 |    ✅ User    |
| `POST`   | `/api/comments/:id/reaction` | Like or dislike a comment          |    ✅ User    |
| `GET`    | `/api/comments/admin`        | List all comments for moderation   |   ✅ Admin    |
| `PATCH`  | `/api/comments/:id/approve`  | Approve a pending comment          |   ✅ Admin    |
| `PATCH`  | `/api/comments/:id/reject`   | Reject a pending comment           |   ✅ Admin    |

---

### ❤️ Favorite Module

| Method | Endpoint                           | Description                | Auth Required |
| ------ | ---------------------------------- | -------------------------- | :-----------: |
| `POST` | `/api/favorites/courses/:courseId` | Toggle course bookmark     |    ✅ User    |
| `GET`  | `/api/favorites/courses`           | Get own bookmarked courses |    ✅ User    |
| `POST` | `/api/favorites/posts/:postId`     | Toggle post bookmark       |    ✅ User    |
| `GET`  | `/api/favorites/posts`             | Get own bookmarked posts   |    ✅ User    |

---

### 🔍 Search Module

| Method | Endpoint      | Description                     | Auth Required |
| ------ | ------------- | ------------------------------- | :-----------: |
| `GET`  | `/api/search` | Search across courses and posts |      ❌       |

---

### 🖼️ Upload Module

| Method | Endpoint                    | Description                       | Auth Required |
| ------ | --------------------------- | --------------------------------- | :-----------: |
| `POST` | `/api/uploads/editor-image` | Upload image for rich-text editor |   ✅ Admin    |

---

### 📊 Overview Module

All overview endpoints are admin-only.

| Method | Endpoint                          | Description              |
| ------ | --------------------------------- | ------------------------ |
| `GET`  | `/api/overview/admin`             | Full dashboard summary   |
| `GET`  | `/api/overview/admin/users`       | User registration stats  |
| `GET`  | `/api/overview/admin/courses`     | Course stats             |
| `GET`  | `/api/overview/admin/orders`      | Order & sales stats      |
| `GET`  | `/api/overview/admin/revenue`     | Revenue breakdown        |
| `GET`  | `/api/overview/admin/discounts`   | Discount usage stats     |
| `GET`  | `/api/overview/admin/comments`    | Comment moderation stats |
| `GET`  | `/api/overview/admin/posts`       | Post engagement stats    |
| `GET`  | `/api/overview/admin/enrollments` | Enrollment stats         |

---

## 🔐 Authentication

This API uses a **dual-authentication mechanism** designed for both web and mobile clients.

### Cookie-Based (Recommended for Web Apps)

Upon successful login or email verification, the server automatically sets two **secure, HttpOnly cookies**:

- `accessToken` — short-lived JWT for API access
- `refreshToken` — long-lived JWT used to obtain a new access token

Cookies are sent automatically by the browser on every request — no extra code needed.

### Bearer Token (Recommended for Mobile / SPA)

The `accessToken` is also returned in the JSON response body. Include it in the `Authorization` header:

```http
Authorization: Bearer <your_access_token>
```

### Token Refresh

When the access token expires, call `POST /api/auth/refresh`. The server reads the `refreshToken` cookie (or accepts it from the request body) and issues a new access token.

### Role-Based Access Control

| Role | Permissions |
| --- | --- |
| `USER` | Access own profile, enroll in courses, manage cart/orders, post comments, reactions, favorites |
| `ADMIN` | Read-only access to admin panel (view dashboard, courses, users, orders, discounts) + comment moderation (approve/reject) |
| `SUPER_ADMIN` | Full control: All ADMIN permissions + full CRUD on courses, categories, teachers, posts, discounts, user management, wallets & stats |

> 📝 **Note:** Protected routes first check for an `accessToken` cookie, then fall back to the `Authorization: Bearer` header.

---

## 🌐 Environment Variables

Copy `.env.example` to `.env` and fill in all required values.

| Variable                 | Description                                         |  Required   |
| ------------------------ | --------------------------------------------------- | :---------: |
| `DATABASE_URL`           | PostgreSQL connection string (supports Neon pooler) |     ✅      |
| `PORT`                   | Server port (default: `3000`)                       |     ✅      |
| `JWT_ACCESS_SECRET`      | Secret key for signing access tokens                |     ✅      |
| `JWT_REFRESH_SECRET`     | Secret key for signing refresh tokens               |     ✅      |
| `FRONTEND_URL`           | Frontend app URL (for CORS & email links)           |     ✅      |
| `BACKEND_URL`            | Backend API base URL                                |     ✅      |
| `CORS_ORIGINS`           | Comma-separated list of allowed CORS origins        |     ✅      |
| `EMAIL_USER`             | Gmail address for SMTP fallback                     |     ✅      |
| `EMAIL_PASS`             | Gmail app password for SMTP fallback                |     ✅      |
| `GMAIL_CLIENT_ID`        | Google OAuth2 client ID                             | ⚠️ Optional |
| `GMAIL_CLIENT_SECRET`    | Google OAuth2 client secret                         | ⚠️ Optional |
| `GMAIL_REFRESH_TOKEN`    | Google OAuth2 refresh token                         | ⚠️ Optional |
| `GMAIL_SENDER_EMAIL`     | Sender email address for Gmail API                  | ⚠️ Optional |
| `CLOUDINARY_CLOUD_NAME`  | Cloudinary cloud name                               |     ✅      |
| `CLOUDINARY_API_KEY`     | Cloudinary API key                                  |     ✅      |
| `CLOUDINARY_API_SECRET`  | Cloudinary API secret                               |     ✅      |
| `CLOUDINARY_BASE_FOLDER` | Root folder in Cloudinary for uploaded assets       |     ✅      |
| `ZARINPAL_MERCHANT_ID`   | Zarinpal merchant ID (use sandbox UUID for testing) |     ✅      |
| `TELEGRAM_BOT_TOKEN`     | Telegram bot token for error notifications          | ⚠️ Optional |
| `TELEGRAM_CHAT_ID`       | Telegram chat/channel ID to receive alerts          | ⚠️ Optional |
| `ENABLE_TEST_ROUTES`     | Set to `true` to enable test error routes in dev    | ⚠️ Optional |

> ⚠️ **Warning:** If `GMAIL_CLIENT_ID` and `GMAIL_REFRESH_TOKEN` are set, the Gmail OAuth2 API is used for sending emails. Otherwise, the system falls back to SMTP with `EMAIL_USER` and `EMAIL_PASS`.

---

## 📝 Scripts

| Script      | Command                           | Description                                   |
| ----------- | --------------------------------- | --------------------------------------------- |
| Development | `pnpm run dev`                    | Start server with nodemon (hot reload)        |
| Production  | `pnpm run start`                  | Generate Prisma client and start server       |
| Build       | `pnpm run build`                  | Generate Prisma client                        |
| Test        | `pnpm run test`                   | Run all tests once with Vitest                |
| Test Watch  | `pnpm run test:watch`             | Run tests in watch mode                       |
| Test UI     | `pnpm run test:ui`                | Open Vitest browser UI                        |
| DB Migrate  | `pnpm exec prisma migrate dev`    | Create and apply a new migration (dev)        |
| DB Deploy   | `pnpm exec prisma migrate deploy` | Apply pending migrations (production)         |
| DB Studio   | `pnpm exec prisma studio`         | Open Prisma Studio visual DB browser          |
| DB Generate | `pnpm exec prisma generate`       | Regenerate Prisma client after schema changes |

---

## 🗄️ Database Schema

The database is powered by PostgreSQL with Prisma ORM. Here's a summary of the core models:

<details>
<summary>Click to expand schema overview</summary>

| Model            | Description                                                                                        |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| `User`           | Platform users with roles (`USER`/`ADMIN`/`SUPER_ADMIN`), verification, ban status, and reset/change-email flows |
| `Wallet`         | One-to-one with User, stores balance in IRR                                                        |
| `Transaction`    | Financial record for charges, purchases, and refunds with Zarinpal authority tracking              |
| `Category`       | Taxonomy for courses and posts, with visibility toggle                                             |
| `Teacher`        | Instructor profiles with bio, avatar, and slug                                                     |
| `Course`         | Courses with pricing, level (`BEGINNER`/`INTERMEDIATE`/`ADVANCED`), slug, and publish status       |
| `Enrollment`     | Many-to-many between User and Course, records price paid at time of purchase                       |
| `Cart`           | One per user, holds CartItems and an optional discount code                                        |
| `CartItem`       | Junction between Cart and Course                                                                   |
| `Order`          | Purchase record with subtotal, discount, total, and payment method                                 |
| `OrderItem`      | Snapshot of course data at time of purchase (preserves history)                                    |
| `Post`           | Blog posts with rich content, image, slug, and publish status                                      |
| `Comment`        | Nested comments on Courses or Posts with moderation status (`PENDING`/`APPROVED`/`REJECTED`)       |
| `Reaction`       | Like/Dislike on Courses, Posts, or Comments (one per user per target)                              |
| `CourseFavorite` | User bookmarks for courses                                                                         |
| `BlogFavorite`   | User bookmarks for blog posts                                                                      |
| `Discount`       | Discount codes with type (`PERCENTAGE`/`AMOUNT`), usage limits, and expiry                         |

</details>

---

## 🤝 Contributing

Contributions are welcome. Please follow this workflow:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request against `main`

Please ensure your code follows the existing style and all tests pass before submitting a PR.

```bash
# Run tests before pushing
pnpm run test
```

---

<div align="center">
  <p>Made with ❤️ by Abbas Rostami</p>
  <p>⭐ Star this repo if you find it useful!</p>
</div>
