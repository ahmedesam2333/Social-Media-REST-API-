<div align="center">

# 🌐 Social Media REST API

**Social Networking Platform — REST API Backend**

![Status](https://img.shields.io/badge/Status-In_Progress-f59e0b?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)

<br/>

> A secure, scalable backend for a modern social media platform built with **TypeScript**.
> Fully typed end-to-end — from request validation to database models — with clean architecture, robust authentication, and a modular structure designed to grow.

</div>

---

## Table of Contents

- [Overview](#overview)
- [Implemented Features](#implemented-features)
- [Tech Stack](#tech-stack)
- [Database Models](#database-models)
- [Project Structure](#project-structure)
- [Security Design](#security-design)
- [API Reference](#api-reference)
- [Roadmap](#roadmap)
- [Author](#author)

---

## Overview

A full-featured social networking REST API built with TypeScript and Node.js. Users can register, build profiles, publish posts, interact through comments and likes, connect with friends, and chat in real time. The backend is organized into focused modules — auth, profiles, feed, comments, social connections, and cloud storage — each backed by clean service layers, strict validation, and typed interfaces throughout.

**Core flow:**

1. A user registers and receives a 6-digit OTP via email for verification
2. They confirm their email using the OTP, then authenticate with JWT credentials
3. They build a profile with image and cover uploads stored on AWS S3
4. They publish posts, control visibility, and interact with others' content via likes and comments
5. They send and accept friend requests to build their social graph
6. They open real-time chat sessions powered by Socket.io
7. Admins manage roles and accounts via a protected dashboard

---

## Implemented Features

### 🔐 Authentication & Security

**Express Application Bootstrap**
- Initialized Express application with a modular middleware stack and centralized routing via `app.controller.ts`
- Configured global security middleware: Helmet, CORS, and rate limiting (200 req/hr per IP)

**Generic Request Validation Middleware**
- Built a reusable `validation` middleware that validates any combination of `body`, `params`, or `query` against Zod schemas
- Centralized `generalFields` exports shared field schemas: `email`, `password`, `username`, `phone`, and `otp`
- Returns `400 Validation Error` responses with structured field-level error messages including path and message per issue

**Authentication Middleware**
- `authentication` middleware extracts and validates the `Authorization` header, decodes the JWT, and injects the hydrated `user` document and `decoded` payload into the Express `Request` object via `IAuthReq`
- Supports role-aware token decoding using `SignatureLevelEnum` (`Bearer` for users, `System` for admins)

**Repository Pattern — `DB/repository/`**
- Abstract `DatabaseRepository<TDocument>` base class wraps Mongoose operations (`create`, `findOne`, `updateOne`) with fully typed generics — `QueryFilter`, `ProjectionType`, `UpdateQuery`, and `PopulateOptions`
- `updateOne` automatically increments `__v` on every write for optimistic concurrency tracking
- `UserRepository` extends the base with a `createUser` method that destructures the first created document and throws `BadRequestException` on failure

**JWT Token System — `utils/security/token.security.ts`**
- `generateToken` and `verifyToken` wrap `jsonwebtoken` with typed payloads and configurable secrets and expiry via environment variables
- `detectSignatureLevel` maps user roles to `SignatureLevelEnum`, selecting the appropriate key pair
- `getSignatures` resolves the correct access and refresh secret pair based on signature level (user vs admin)
- `createLoginCredentials` issues both an access token and a refresh token for the authenticated user
- `decodeToken` parses the `Authorization` header, verifies the token against the matching signature, validates payload shape, and returns the full hydrated user document alongside the decoded JWT

**Password & OTP Hashing — `utils/security/hash.security.ts` · `utils/otp.ts`**
- `generateHash` and `compareHash` wrap `bcrypt` with a configurable salt round from environment config
- `generateOtp` produces a cryptographically random 6-digit numeric OTP and returns both the plain value (for delivery) and a bcrypt hash (for storage)

**Structured Exception Hierarchy — `utils/response/error.response.ts`**
- `ApplicationException` base class with `statusCode`, `cause`, and stack capture
- Named subclasses: `BadRequestException` (400), `NotFoundException` (404), `ConflictException` (409), `UnauthorizedException` (401), `ForbiddenException` (403)
- `globalErrorHandling` Express error middleware returns uniform JSON responses; stack traces are exposed only in `DEV` mode

**Transactional Email System — `utils/email/` · `utils/event/`**
- `sendEmail` configures a Nodemailer Gmail SMTP transporter, enforces content presence, and injects the sender identity from environment config
- `emailTemplate` renders a fully styled dark-mode HTML email with the OTP code embedded and a 2-minute expiry notice
- `emailEvent` is a Node.js `EventEmitter` that decouples email dispatch from service logic — the `confirmEmail` event handler populates subject, HTML, and plain-text body before calling `sendEmail`

**Auth Module — `modules/auth/`**
- `signup` — validates input, checks for email conflicts, hashes the password, generates and stores a hashed OTP, creates the user record via `UserRepository`, and fires the `confirmEmail` event
- `login` — validates credentials, checks `confirmedAt` existence, compares the bcrypt password, and issues access and refresh tokens via `createLoginCredentials`
- `confirmEmail` — validates the email and OTP, verifies the hashed OTP, then atomically sets `confirmedAt` and unsets `confirmEmailOtp` in a single `updateOne` call

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Validation | Zod |
| Auth | JWT (access & refresh tokens) |
| Security | CORS · Helmet · express-rate-limit |
| Password | bcrypt |
| File Upload | Multer + AWS S3 |
| Real-Time | Socket.io |
| Email | Nodemailer (Gmail SMTP) |
| Config | dotenv |

---

## Database Models

### User — `src/DB/models/User.model.ts`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | MongoDB primary key |
| `firstName` | String | Required · 2–25 chars |
| `lastName` | String | Required · 2–25 chars |
| `username` | Virtual | Getter/setter that combines first and last name |
| `email` | String | Required · Unique index |
| `password` | String | Required · bcrypt hashed |
| `phone` | String | Optional · Egyptian format validation |
| `address` | String | Optional |
| `gender` | String | `male` / `female` · Default: `male` |
| `role` | String | `user` / `admin` · Default: `user` |
| `confirmedAt` | Date | Email verification timestamp · set on OTP confirmation |
| `confirmEmailOtp` | String | Hashed OTP for email verification · unset after confirmation |
| `resetPasswordOtp` | String | Hashed OTP for password reset · unset after reset |
| `changeCredentialsTime` | Date | Updated on password change · invalidates prior sessions |
| `createdAt` | Date | Auto-generated via `timestamps` |
| `updatedAt` | Date | Auto-updated via `timestamps` |

**Enums**

| Enum | Values |
|---|---|
| `RoleEnum` | `user`, `admin` |
| `GenderEnum` | `male`, `female` |

---

## Project Structure

```
SOCIAL-MEDIA-REST-API/
├── src/
│   ├── DB/
│   │   ├── db.connection.ts
│   │   ├── models/
│   │   │   └── User.model.ts              # IUser interface, enums, schema, HUserDocument type
│   │   └── repository/
│   │       ├── database.repository.ts     # Abstract generic Mongoose repository
│   │       └── user.repository.ts         # User-specific repository extending the base
│   ├── middleware/
│   │   ├── authentication.middleware.ts   # JWT auth middleware — injects user + decoded into req
│   │   └── validation.middleware.ts       # Generic Zod validation middleware + generalFields
│   ├── modules/
│   │   └── auth/
│   │       ├── auth.controller.ts         # Route definitions — signup, login, confirm-email
│   │       ├── auth.service.ts            # Business logic — signup, login, confirmEmail handlers
│   │       ├── auth.validation.ts         # Zod schemas for signup, login, confirmEmail
│   │       └── auth.dto.ts                # Input types inferred from Zod schemas
│   ├── utils/
│   │   ├── email/
│   │   │   ├── send.email.ts              # Nodemailer transporter + sendEmail function
│   │   │   └── verify.template.email.ts  # Dark-mode HTML OTP email template
│   │   ├── event/
│   │   │   └── email.event.ts             # EventEmitter — confirmEmail event handler
│   │   ├── response/
│   │   │   └── error.response.ts          # Exception classes + globalErrorHandling middleware
│   │   ├── security/
│   │   │   ├── hash.security.ts           # bcrypt generateHash + compareHash
│   │   │   └── token.security.ts          # JWT generate, verify, decode, createLoginCredentials
│   │   └── otp.ts                         # generateOtp — random 6-digit OTP + bcrypt hash
│   ├── app.controller.ts                  # Express bootstrap — middleware stack, routing
│   └── index.ts                           # Entry point
├── .env
├── .env.example
├── .gitignore
├── tsconfig.json
├── package.json
└── README.md
```

---

## Security Design

- **Helmet** — Secure HTTP headers applied to every response
- **CORS** — Enabled globally
- **Rate Limiting** — 200 requests per hour per IP; excess requests return `429` with a JSON error body
- **Zod** — Strict schema validation on every request boundary; unknown fields are rejected outright
- **Password Policy** — Minimum 8 characters; requires uppercase, lowercase, digit, and special character
- **Phone Validation** — Egyptian numbers only (`010 / 011 / 012 / 015`)
- **OTP Security** — 6-digit numeric OTPs are bcrypt-hashed before storage and unset from the document after use
- **JWT Dual-Token** — Separate access and refresh tokens with role-aware signing keys (`Bearer` for users, `System` for admins)
- **Environment-Aware Error Reporting** — Stack traces exposed only in `DEV` mode; production responses reveal no internal details

---

## API Reference

**Base URL:** `http://localhost:5000`

> 🔒 Protected routes require `Authorization: Bearer <token>`
>
> All routes return `400 Validation Error` on invalid input — omitted per endpoint for brevity.

---

### Auth — `/auth`

<details>
<summary><code>POST</code> &nbsp; <code>/auth/signup</code> &nbsp;—&nbsp; Register a new user</summary>

<br/>

**Body**
```json
{
  "username": "Ahmed Essam",
  "email": "ahmed@example.com",
  "password": "Ahmed@1234",
  "phone": "01012345678"
}
```

**Validation**

| Field | Rules |
|---|---|
| `username` | Required · must be exactly two words (first and last name) · 3–20 chars |
| `email` | Required · valid email format |
| `password` | Required · min 8 chars · must include uppercase, lowercase, digit, and special character |
| `phone` | Required · Egyptian numbers only: `010 / 011 / 012 / 015` |

**Responses**

| Status | Description |
|---|---|
| `201` | User registered — OTP sent to email for verification |
| `400` | Validation error |
| `409` | Email already registered |

</details>

---

<details>
<summary><code>POST</code> &nbsp; <code>/auth/login</code> &nbsp;—&nbsp; Authenticate with credentials</summary>

<br/>

**Body**
```json
{
  "email": "ahmed@example.com",
  "password": "Ahmed@1234"
}
```

**Responses**

| Status | Description |
|---|---|
| `200` | Login successful — returns `access_token` and `refresh_token` |
| `400` | Validation error |
| `404` | Invalid credentials or email not verified |

</details>

---

<details>
<summary><code>PATCH</code> &nbsp; <code>/auth/confirm-email</code> &nbsp;—&nbsp; Verify email with OTP</summary>

<br/>

**Body**
```json
{
  "email": "ahmed@example.com",
  "otp": "483920"
}
```

**Validation**

| Field | Rules |
|---|---|
| `email` | Required · valid email format |
| `otp` | Required · exactly 6 digits |

**Responses**

| Status | Description |
|---|---|
| `200` | Email verified — user may now log in |
| `400` | Invalid or expired OTP |
| `404` | Email not found or already confirmed |

</details>

---

## Roadmap

The following modules represent the planned scope of the project. Built incrementally — this section updates as each feature ships.

---

### 👤 1. User Profile & Role Management

Features related to managing user data, access tiers, and custom metadata.

- **Role-Based Access Control (RBAC)** — Detecting user roles and signature levels; admin dashboard management using `Promise.allSettled`; dynamically changing a user's system role
- **Profile & Cover Image Management** — Uploading and updating profile pictures and cover photos; automated cleanup via Node events to delete old images on replacement
- **Global Request Object Enhancement** — Extending the Express `Request` interface to inject authenticated user data and authorization metadata seamlessly into route handlers

---

### 📰 2. Feed & Post System

The core content engine of the application, managing user posts and feed optimization.

- **Post Creation & Validation** — Building post data models and implementing request validation before publishing
- **Post Availability Control** — Managing public visibility states and structural access conditions for posts
- **Post Modification** — Updating posts using optimized MongoDB/Mongoose Aggregation Pipelines
- **Feed Pagination** — High-performance post retrieval using pagination to limit payload sizes and boost loading speeds
- **Engagement Metrics** — Like and Unlike capabilities on posts via automated database hooks

---

### 💬 3. Comment & Interaction System

Features that allow users to converse and engage underneath published content.

- **Multi-Level Commenting** — Top-level comments on posts; replies on comments; nested replies on existing replies
- **Route Parameter Merging** — Leveraging Express `mergeParams` to cleanly handle nested routing (e.g., `/posts/:postId/comments`)
- **Optimized Performance Queries** — Fetching posts with associated comments using Virtual Populate and streaming techniques

---

### 🤝 4. Social Connections & Real-Time Chat

The networking layer, transitioning the application from static data into live, real-time interactivity.

- **Friendship Lifecycle** — Send, receive, accept, and process friend requests between users
- **Real-Time Architecture** — Full Socket.io integration for persistent, bidirectional communication
- **Authenticated Handshakes** — Securing socket connections during initial handshake with specialized WebSocket error handling
- **Event-Driven Communication** — Advanced dispatching patterns: targeted emit, broadcast, `io.emit` (global), and io-except-emit
- **Multiplexing (Namespaces)** — Splitting socket traffic into dedicated channels to isolate chat from notifications
- **Delivery Acknowledgments (ACK)** — Socket acknowledgments for reliable message delivery
- **Chat User Directory** — Fetching active chat participants matched with real-time statuses and profile imagery

---

### ☁️ 5. Cloud Storage & Asset Management (AWS S3)

The file processing pipeline built to handle media uploads efficiently without blocking server execution.

- **Multer Storage Architecture** — Disk Storage vs Memory Storage evaluation; temporary OS staging for large file offloading
- **File Constraints** — Hard enforcement of file size limits and extension type validation
- **AWS S3 Bucket Integration** — Secure cloud bucket configuration
- **Optimized Upload Mechanics** — Standard uploads via `PutObjectCommand`; chunked processing for large assets
- **Secure Access via Pre-signed URLs** — `preUploadSignedUrl` for direct client-to-S3 uploads; `getAsset` pre-signed URLs for secure private asset retrieval
- **File & Folder Purging** — Single deletion, batch deletion, and directory purging using S3 prefix-matching patterns
- **Soft vs Hard Deletion** — Balancing data safety with permanent cleanup using soft-restore logic alongside definitive hard deletes

---

## 👨‍💻 Author

**Ahmed Essam** — Node.js Backend Engineer

📩 ahmedezsam@gmail.com · 🔗 [LinkedIn](https://linkedin.com/in/ahmed-essam-33b989221)

---

<div align="center">
<sub>Built with TypeScript, clean architecture, and strong opinions ☕</sub>
</div>
