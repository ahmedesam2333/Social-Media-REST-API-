<div align="center">

# 🌐 Social Media REST API

**Social Networking Platform — REST API Backend**

![Status](https://img.shields.io/badge/Status-In_Progress-f59e0b?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![AWS S3](https://img.shields.io/badge/AWS_S3-FF9900?style=for-the-badge&logo=amazons3&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)

<br/>

> A secure, scalable backend for a modern social media platform built with **TypeScript**.
> Fully typed end-to-end — from request validation to database models — with clean architecture, robust authentication, token revocation, file uploads to AWS S3, and a modular structure designed to grow.

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

A full-featured social networking REST API built with TypeScript and Node.js. Users can register, build profiles, publish posts, interact through comments and likes, connect with friends, and chat in real time. The backend is organized into focused modules — auth, user, profiles, feed, comments, social connections, and cloud storage — each backed by clean service layers, strict validation, and typed interfaces throughout.

**Core flow:**

1. User registers → receives a 6-digit OTP via email
2. Confirms email with OTP → gains access to login
3. Authenticates → receives JWT access & refresh tokens
4. Refreshes session via refresh token → old token revoked, new pair issued
5. Builds profile, uploads profile image to AWS S3
6. Publishes posts, interacts with content
7. Sends friend requests, opens real-time chat via Socket.io
8. Admins manage roles and accounts via a protected dashboard

---

## Implemented Features

### 🏗️ Application Bootstrap

Initialized Express with a modular middleware stack and centralized routing via `app.controller.ts`. Global middleware applied: **Helmet** (secure headers), **CORS**, and **rate limiting** (200 req/hr per IP, `429` on excess).

---

### 🗄️ Repository Pattern — `DB/repository/`

Abstract `DatabaseRepository<TDocument>` wraps Mongoose with fully typed generics. All model-specific repositories extend it.

| Method | Behavior |
|---|---|
| `create` | Inserts documents with optional `CreateOptions` |
| `findOne` | Supports projection, lean mode, and populate |
| `updateOne` | Applies update and auto-increments `__v` for optimistic concurrency |

`UserRepository` extends the base with `createUser` — unwraps the first result and throws `BadRequestException` on failure.

`TokenRepository` extends the base repository with no additional methods — serves as the typed interface for revoked token storage.

---

### ✅ Request Validation — `middleware/validation.middleware.ts`

- `validation(schema)` — validates any mix of `body`, `params`, or `query` against Zod schemas; returns structured `400` errors with field path and message per issue
- `generalFields` — shared canonical schemas (`email`, `password`, `username`, `phone`, `otp`) imported across all modules

---

### 🔑 JWT Token System — `utils/security/token.security.ts`

Role-aware dual-token architecture with separate signing keys for users and admins. Supports token revocation via a dedicated `Token` model (blocklist pattern).

| Utility | Description |
|---|---|
| `generateToken` | Signs a payload with configurable secret and expiry |
| `verifyToken` | Verifies and returns the decoded `JwtPayload` |
| `detectSignatureLevel` | Maps `RoleEnum` → `SignatureLevelEnum` (`Bearer` / `System`) |
| `getSignatures` | Resolves the correct access + refresh key pair by signature level |
| `createLoginCredentials` | Issues both access and refresh tokens with shared `jwtid` for the authenticated user |
| `decodeToken` | Parses `Authorization` header, checks blocklist, verifies token, validates payload, returns hydrated user |
| `createRevokedToken` | Stores a revoked token's `jti` in the `Token` collection to block future use |

**Token Revocation — Blocklist Pattern**

When a user logs out (`only` mode) or refreshes their session, the current token's `jti` is written to `Token`. Every `decodeToken` call checks the blocklist — matching `jti` triggers `UnauthorizedException`. Tokens remain blocked until their natural `expiresIn` timestamp passes (TTL cleanup can be configured via a MongoDB TTL index).

---

### 🔐 Authentication & Authorization Middleware — `middleware/authentication.middleware.ts`

Two separate middleware factories for different access patterns:

| Middleware | Behavior |
|---|---|
| `authentication(tokenType)` | Extracts and verifies `Authorization` header; injects `user` and `decoded` into `IAuthReq`; defaults to access token |
| `authorization(accessRoles, tokenType)` | Extends authentication with role check; throws `ForbiddenException` if `user.role` is not in `accessRoles` |

---

### 🔒 Hashing & OTP — `utils/security/hash.security.ts` · `utils/otp.ts`

- `generateHash` / `compareHash` — bcrypt wrappers with salt round from env config
- `generateOtp` — produces a cryptographically random 6-digit OTP, returns plain value (for delivery) and bcrypt hash (for storage)

---

### ✉️ Transactional Email — `utils/email/` · `utils/event/`

Event-driven email dispatch fully decoupled from service logic.

- **`sendEmail`** — Nodemailer Gmail SMTP transporter; enforces content presence; injects sender identity from env
- **`emailTemplate`** — Dark-mode HTML email with embedded OTP and branded header
- **`emailEvent`** — Node.js `EventEmitter`; the `confirmEmail` listener composes subject, HTML, and plain-text body then calls `sendEmail`

**OTP Email Preview**

![OTP Email](https://drive.google.com/uc?export=view&id=1voPj8xx9mCEOA10FSuUPOAA4loHNsWz9)

---

### ⚠️ Exception Hierarchy — `utils/response/error.response.ts`

`ApplicationException` base with `statusCode`, `cause`, and stack capture. Named subclasses:

| Class | Status |
|---|---|
| `BadRequestException` | `400` |
| `UnauthorizedException` | `401` |
| `ForbiddenException` | `403` |
| `NotFoundException` | `404` |
| `ConflictException` | `409` |

`globalErrorHandling` middleware returns uniform JSON error responses. Stack traces are only exposed in `DEV` mode.

---

### 🏷️ Express Type Extension — `utils/types/request.express.ts`

Augments Express's `Request` interface to carry authenticated request context:

```typescript
declare module "express-serve-static-core" {
  interface Request {
    user?: HUserDocument;
    decoded?: JwtPayload;
  }
}
```

Ensures `req.user` and `req.decoded` are fully typed across all route handlers and service methods without casting.

---

### ☁️ File Upload — `utils/multer/` · AWS S3

Multer-based upload pipeline with configurable storage strategy and AWS S3 integration.

**`cloud.multer.ts`**

| Export | Description |
|---|---|
| `StorageEnum` | `memory` (buffer) or `disk` (OS temp dir via `os.tmpdir()`) |
| `fileValidation` | MIME type allowlists — e.g. `image: ["image/jpeg", "image/png"]` |
| `cloudFileUpload({ validation, storageApproach, maxSizeMB })` | Returns a configured `Multer` instance; rejects invalid MIME types with a structured `400`; enforces file size limit (default 2 MB) |

**`s3.config.ts`**

| Export | Description |
|---|---|
| `s3Config()` | Constructs an `S3Client` from env credentials (`AWS_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_ACCESS_KEY`) |
| `uploadFile({ file, path, storageApproach, Bucket, ACL })` | Issues `PutObjectCommand`; key format: `{APP_NAME}/{path}/{uuid}_{filename}`; supports both memory buffer and disk stream bodies; returns the generated S3 key |

**Profile Image on AWS S3**

📁 [S3 Bucket Screenshots Folder](https://drive.google.com/drive/folders/1XdL-xMcTywXJI9yk-iTvxZpCZsNa09dh?usp=sharing)

![Profile Image S3](https://drive.google.com/uc?export=view&id=1oOLKFpNQTXK8KSfR4IVwdD-K9MIrYBJy)

---

### 🔏 Auth Module — `modules/auth/`

| Endpoint | Description |
|---|---|
| `POST /auth/signup` | Checks email uniqueness, hashes password, stores bcrypt OTP, fires `confirmEmail` event |
| `POST /auth/login` | Verifies credentials and `confirmedAt` guard, issues access + refresh tokens |
| `PATCH /auth/confirm-email` | Verifies OTP, then atomically `$set confirmedAt` + `$unset confirmEmailOtp` |

---

### 👤 User Module — `modules/user/`

Handles authenticated user operations: profile retrieval, session management, and profile image uploads.

**Authorization map — `user.authorization.ts`**

| Endpoint | Allowed Roles |
|---|---|
| `GET /user/` (profile) | `user` |

| Endpoint | Description |
|---|---|
| `GET /user/` | Returns the authenticated user's document and decoded JWT payload |
| `POST /user/refresh-token` | Verifies refresh token → revokes it → issues a new access + refresh pair |
| `POST /user/logout` | Single-session (`only`) revokes current `jti`; all-session (`all`) sets `changeCredentialsTime` to invalidate every prior token |
| `PATCH /user/profile-image` | Accepts `image/jpeg` or `image/png` (max 2 MB) via `multipart/form-data`; uploads to S3 at `users/{userId}/{uuid}_{filename}`; returns the S3 key |

**Logout modes**

| `flag` | Mechanism | Status |
|---|---|---|
| `only` (default) | Writes `jti` to blocklist (`Token` collection) | `201` |
| `all` | Sets `changeCredentialsTime = now` — all tokens issued before this timestamp are invalid | `200` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Validation | Zod |
| Auth | JWT (access & refresh tokens) · Token blocklist |
| Security | CORS · Helmet · express-rate-limit |
| Password | bcrypt |
| Email | Nodemailer (Gmail SMTP) |
| File Upload | Multer (memory & disk) + AWS S3 (`@aws-sdk/client-s3`) |
| Real-Time | Socket.io |
| Config | dotenv |

---

## Database Models

### User — `src/DB/models/User.model.ts`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | MongoDB primary key |
| `firstName` | String | Required · 2–25 chars |
| `lastName` | String | Required · 2–25 chars |
| `username` | Virtual | Getter/setter — combines `firstName` + `lastName` |
| `email` | String | Required · Unique index |
| `password` | String | Required · bcrypt hashed |
| `phone` | String | Optional · Egyptian format (`010 / 011 / 012 / 015`) |
| `address` | String | Optional |
| `gender` | `GenderEnum` | `male` / `female` · Default: `male` |
| `role` | `RoleEnum` | `user` / `admin` · Default: `user` |
| `confirmedAt` | Date | Set on OTP confirmation |
| `confirmEmailOtp` | String | Hashed OTP · unset after confirmation |
| `resetPasswordOtp` | String | Hashed OTP · unset after reset |
| `changeCredentialsTime` | Date | Updated on password change or all-session logout · invalidates prior sessions |
| `createdAt` | Date | Auto-generated via `timestamps` |
| `updatedAt` | Date | Auto-updated via `timestamps` |

**Enums**

| Enum | Values |
|---|---|
| `RoleEnum` | `user`, `admin` |
| `GenderEnum` | `male`, `female` |

---

### Token — `src/DB/models/Token.model.ts`

Blocklist store for revoked JWTs. Each document represents a single invalidated token identified by its `jti` claim.

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | MongoDB primary key |
| `jti` | String | Required · Unique · JWT ID claim from the revoked token |
| `expiresIn` | Number | Unix timestamp — token's natural expiry; can drive a TTL index for automatic cleanup |
| `userId` | ObjectId | Required · Ref: `User` |
| `createdAt` | Date | Auto-generated via `timestamps` |
| `updatedAt` | Date | Auto-updated via `timestamps` |

---

## Project Structure

```
SOCIAL-MEDIA-REST-API/
├── src/
│   ├── DB/
│   │   ├── db.connection.ts                   # Mongoose connect + syncIndexes for all models
│   │   ├── models/
│   │   │   ├── User.model.ts                  # IUser interface, enums, schema, HUserDocument type
│   │   │   └── Token.model.ts                 # IToken interface, schema, HTokenDocument type
│   │   └── repository/
│   │       ├── database.repository.ts         # Abstract generic Mongoose repository
│   │       ├── user.repository.ts             # User-specific repository
│   │       └── token.repository.ts            # Token (blocklist) repository
│   ├── middleware/
│   │   ├── authentication.middleware.ts       # authentication() + authorization() factories
│   │   └── validation.middleware.ts           # Generic Zod validation + generalFields
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts             # Route definitions
│   │   │   ├── auth.service.ts                # Business logic — signup, login, confirmEmail
│   │   │   ├── auth.validation.ts             # Zod schemas
│   │   │   └── auth.dto.ts                    # Input types inferred from Zod schemas
│   │   └── user/
│   │       ├── user.controller.ts             # Route definitions — profile, refresh, logout, profileImage
│   │       ├── user.service.ts                # Business logic — UserService class
│   │       ├── user.validation.ts             # Zod schemas (logout flag)
│   │       ├── user.dto.ts                    # Input types inferred from Zod schemas
│   │       └── user.authorization.ts          # Role-to-endpoint access map
│   ├── utils/
│   │   ├── email/
│   │   │   ├── send.email.ts                  # Nodemailer transporter
│   │   │   └── verify.template.email.ts       # Dark-mode HTML OTP template
│   │   ├── event/
│   │   │   └── email.event.ts                 # EventEmitter — confirmEmail handler
│   │   ├── multer/
│   │   │   ├── cloud.multer.ts                # Multer factory — StorageEnum, fileValidation, cloudFileUpload
│   │   │   └── s3.config.ts                   # S3Client config + uploadFile utility
│   │   ├── response/
│   │   │   └── error.response.ts              # Exception classes + globalErrorHandling
│   │   ├── security/
│   │   │   ├── hash.security.ts               # bcrypt helpers
│   │   │   └── token.security.ts              # JWT utilities + login credentials + token revocation
│   │   ├── types/
│   │   │   └── request.express.ts             # Express Request type augmentation (user, decoded)
│   │   └── otp.ts                             # OTP generation + hashing
│   ├── app.controller.ts                      # Express bootstrap
│   └── index.ts                               # Entry point
├── .env
├── .env.example
├── .gitignore
├── tsconfig.json
├── package.json
└── README.md
```

---

## Security Design

| Concern | Implementation |
|---|---|
| Secure Headers | Helmet applied globally |
| CORS | Enabled on all routes |
| Rate Limiting | 200 req/hr per IP · `429` on excess |
| Input Validation | Zod strict schemas · unknown fields rejected |
| Password Policy | Min 8 chars · uppercase + lowercase + digit + special char |
| Phone Validation | Egyptian numbers only (`010 / 011 / 012 / 015`) |
| OTP Security | bcrypt-hashed at rest · unset from document after use |
| JWT Strategy | Dual-token (access + refresh) · role-aware signing keys · shared `jwtid` per session |
| Token Revocation | Blocklist via `Token` collection — `jti` checked on every request; `all` logout sets `changeCredentialsTime` |
| Authorization | Role-based middleware factory (`authorization(roles[])`) — throws `403` on mismatch |
| File Uploads | MIME type allowlist · 2 MB hard limit · UUID-prefixed S3 keys scoped to `{APP}/{path}/` |
| Error Exposure | Stack traces in `DEV` only · production responses reveal no internals |

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
| `username` | Required · exactly two words (first + last name) · 3–20 chars |
| `email` | Required · valid email format |
| `password` | Required · min 8 chars · uppercase + lowercase + digit + special char |
| `phone` | Required · Egyptian numbers only (`010 / 011 / 012 / 015`) |

**Responses**

| Status | Description |
|---|---|
| `201` | Registered — OTP sent to email |
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
| `200` | Returns `access_token` and `refresh_token` |
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

### User — `/user`

<details>
<summary><code>GET</code> &nbsp; <code>/user/</code> &nbsp;—&nbsp; Get authenticated user profile 🔒</summary>

<br/>

**Headers**

| Header | Value |
|---|---|
| `Authorization` | `Bearer <access_token>` |

**Responses**

| Status | Description |
|---|---|
| `200` | Returns user document and decoded JWT payload |
| `401` | Missing or invalid token |

</details>

---

<details>
<summary><code>POST</code> &nbsp; <code>/user/refresh-token</code> &nbsp;—&nbsp; Issue a new token pair 🔒</summary>

<br/>

**Headers**

| Header | Value |
|---|---|
| `Authorization` | `Bearer <refresh_token>` |

**Responses**

| Status | Description |
|---|---|
| `201` | New `access_token` and `refresh_token` issued · old refresh token revoked |
| `401` | Missing, invalid, or already-revoked refresh token |

</details>

---

<details>
<summary><code>POST</code> &nbsp; <code>/user/logout</code> &nbsp;—&nbsp; Invalidate session 🔒</summary>

<br/>

**Headers**

| Header | Value |
|---|---|
| `Authorization` | `Bearer <access_token>` |

**Body**
```json
{
  "flag": "only"
}
```

**Validation**

| Field | Rules |
|---|---|
| `flag` | Optional · enum: `only` \| `all` · Default: `only` |

**Responses**

| Status | Flag | Description |
|---|---|---|
| `201` | `only` | Current token's `jti` added to blocklist |
| `200` | `all` | `changeCredentialsTime` updated — all prior sessions invalidated |
| `401` | — | Missing or invalid token |

</details>

---

<details>
<summary><code>PATCH</code> &nbsp; <code>/user/profile-image</code> &nbsp;—&nbsp; Upload profile image 🔒</summary>

<br/>

**Headers**

| Header | Value |
|---|---|
| `Authorization` | `Bearer <access_token>` |
| `Content-Type` | `multipart/form-data` |

**Form Fields**

| Field | Rules |
|---|---|
| `image` | Required · `image/jpeg` or `image/png` · max 2 MB |

**Responses**

| Status | Description |
|---|---|
| `200` | Returns S3 key of the uploaded image |
| `400` | Invalid file format or size exceeded |
| `401` | Missing or invalid token |

**Example Response**
```json
{
  "message": "Done",
  "data": {
    "key": "Social Media REST API/users/6a3851a6e743d001e507d4db/733c16f6-f752-49f2-820b-20ccef6ac1f2_AhmedEssam.jpg"
  }
}
```

</details>

---

## Roadmap

The following modules represent the planned scope of the project. Built incrementally — this section updates as each feature ships.

---

### 👤 1. User Profile & Role Management

- **Role-Based Access Control (RBAC)** — Role detection and signature-level enforcement; admin dashboard using `Promise.allSettled`; dynamic role updates ✅ (authorization middleware complete)
- **Profile & Cover Image Management** — Upload and replace profile/cover photos with automated old-image cleanup via Node events ✅ (profile image upload to S3 complete)
- **Request Object Enhancement** — Extending Express `Request` to carry authenticated user data and authorization metadata into route handlers ✅

---

### 📰 2. Feed & Post System

- **Post Creation & Validation** — Post data models with full request validation before publishing
- **Visibility Control** — Public/private post states and structural access conditions
- **Post Updates** — Optimized modifications via MongoDB Aggregation Pipelines
- **Feed Pagination** — High-performance retrieval with cursor-based pagination
- **Engagement** — Like/Unlike on posts via automated database hooks

---

### 💬 3. Comment & Interaction System

- **Multi-Level Commenting** — Top-level comments, replies on comments, and nested replies
- **Nested Routing** — Express `mergeParams` for clean `/posts/:postId/comments` routing
- **Optimized Fetching** — Posts with comments via Virtual Populate and streaming

---

### 🤝 4. Social Connections & Real-Time Chat

- **Friendship Lifecycle** — Send, receive, and accept friend requests
- **Socket.io Integration** — Persistent bidirectional communication with authenticated handshakes
- **Event Dispatching** — Targeted emit, broadcast, `io.emit`, and io-except-emit patterns
- **Namespaces** — Isolated channels for chat and notifications
- **Delivery ACKs** — Socket acknowledgments for reliable message delivery

---

### ☁️ 5. Cloud Storage & Asset Management (AWS S3)

- **Multer Architecture** — Disk vs Memory Storage with OS staging for large files ✅
- **File Constraints** — Hard limits on file size and extension type ✅
- **S3 Integration** — `PutObjectCommand` uploads supporting both memory buffer and disk stream ✅
- **Pre-signed URLs** — `preUploadSignedUrl` for direct client-to-S3 uploads; `getAsset` for secure private retrieval
- **Deletion Patterns** — Single, batch, and prefix-based directory purging
- **Soft vs Hard Delete** — Restore logic alongside definitive permanent cleanup

---

## 👨‍💻 Author

**Ahmed Essam** — Node.js Backend Engineer

📩 ahmedezsam@gmail.com · 🔗 [LinkedIn](https://linkedin.com/in/ahmed-essam-33b989221)

---

<div align="center">
<sub>Built with TypeScript, clean architecture, and strong opinions ☕</sub>
</div>
