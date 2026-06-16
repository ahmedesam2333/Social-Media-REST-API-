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
- [Project Structure](#project-structure)
- [Database Models](#database-models)
- [Security Design](#security-design)
- [API Reference](#api-reference)
- [Roadmap](#roadmap)
- [Deployment](#deployment)
- [Author](#author)

---

## Overview

A full-featured social networking REST API built with TypeScript and Node.js. Users can register, build profiles, publish posts, interact through comments and likes, connect with friends, and chat in real time. The backend is organized into focused modules — auth, profiles, feed, comments, social connections, and cloud storage — each backed by clean service layers, strict validation, and typed interfaces throughout.

**Core flow:**

1. A user registers, verifies their email via OTP, and receives a JWT session
2. They build a profile with image and cover uploads stored on AWS S3
3. They publish posts, control visibility, and interact with others' content via likes and comments
4. They send and accept friend requests to build their social graph
5. They open real-time chat sessions powered by Socket.io
6. Admins manage roles and accounts via a protected dashboard

---

## Implemented Features

### 🔐 Authentication & Request Validation

**Express Application Bootstrap**
- Initialized Express application with a modular middleware stack and centralized routing via `app.controller.ts`
- Configured global security middleware: Helmet, CORS, and rate limiting (200 req/hr per IP)

**Generic Request Validation Middleware**
- Built a reusable `validateRequest` middleware that validates any combination of `body`, `params`, or `query` against Zod schemas
- Centralized validation logic at the request boundary — invalid input is rejected before reaching controllers
- Returns `400 Validation Error` responses with detailed field-level error messages

**Global Error Handling**
- Centralized `globalErrorHandling` middleware using custom exception classes for structured error responses
- Uniform JSON error responses across all routes with consistent error formatting

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
| File Upload | Multer + AWS S3 |
| Real-Time | Socket.io |
| Config | dotenv |

---

## Project Structure

```
SOCIAL-MEDIA-REST-API/
├── src/
│   ├── DB/
│   │   └── db.connection.ts
│   │   └── models/
│   │       └── User.model.ts          # User schema, enums, interfaces
│   ├── middleware/
│   │   └── validation.middleware.ts   # Generic Zod validation middleware + shared field schemas
│   ├── modules/
│   │   └── auth/
│   │       ├── auth.controller.ts     # Route definitions + middleware wiring
│   │       ├── auth.service.ts        # Business logic + token/password operations
│   │       ├── auth.validation.ts     # Zod schemas (login, signup)
│   │       └── auth.dto.ts            # Input type interfaces (inferred from Zod)
│   ├── utils/
│   │   └── response/
│   │       └── error.response.ts      # Exception classes + global error handler
│   ├── app.controller.ts              # Express bootstrap — middleware stack, routing
│   └── index.ts                       # Entry point
├── .env
├── .env.example
├── .gitignore
├── tsconfig.json
├── package.json
└── README.md
```

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
| `confirmedAt` | Date | Email verification timestamp |
| `confirmEmailOtp` | String | Hashed OTP for email verification · removed after confirmation |
| `resetPasswordOtp` | String | Hashed OTP for password reset · removed after reset |
| `changeCredentialsTime` | Date | Updated on password change · invalidates prior sessions |
| `createdAt` | Date | Auto-generated timestamp |
| `updatedAt` | Date | Auto-updated on any modification |

**Enums**

| Enum | Values |
|---|---|
| `RoleEnum` | `user`, `admin` |
| `GenderEnum` | `male`, `female` |

---

## Security Design

- **Helmet** — Secure HTTP headers applied to every response
- **CORS** — Enabled globally
- **Rate Limiting** — 200 requests per hour per IP; excess requests return `429` with a JSON error body
- **Zod** — Strict schema validation on every request boundary; unknown fields are rejected outright
- **Password Policy** — Minimum 8 characters; requires uppercase, lowercase, digit, and special character
- **Phone Validation** — Egyptian numbers only (`010 / 011 / 012 / 015`)
- **Environment-Aware Error Reporting** — Error stack traces are exposed only in `DEV` mode; production responses reveal no internal details

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
| `username` | Required · must be exactly two words (first and last name) |
| `email` | Required · valid email format |
| `password` | Required · min 8 chars · must include uppercase, lowercase, digit, and special character |
| `phone` | Required · Egyptian numbers only: `010 / 011 / 012 / 015` |

**Responses**

| Status | Description |
|---|---|
| `201` | User registered successfully |
| `400` | Validation error |

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
| `200` | Login successful |
| `400` | Validation error |

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
