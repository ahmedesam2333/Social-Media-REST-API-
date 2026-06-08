<div align="center">

# 🌐 Social Media App

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
- [Planned Features — Roadmap](#planned-features--roadmap)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Security Design](#security-design)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Checkpoint](#checkpoint--whats-done)
- [Author](#author)

---

## Overview

A full-featured social networking REST API built with TypeScript and Node.js. Users can register, build profiles, publish posts, interact through comments and likes, connect with friends, and chat in real time. The backend is organized into focused modules — auth, profiles, feed, comments, social connections, and cloud storage — each with clean service layers, strict validation, and typed interfaces throughout.

**Core flow:**

1. A user registers, verifies their email via OTP, and receives a JWT session
2. They build a profile with image and cover uploads stored on AWS S3
3. They publish posts, control visibility, and interact with others' content via likes and comments
4. They send and accept friend requests to build their social graph
5. They open real-time chat sessions powered by Socket.io
6. Admins manage roles and accounts via a protected dashboard

---

## Planned Features — Roadmap

The following modules represent the full planned scope of the project. They will be built incrementally and this section will be updated as each one ships.

---

### 🔐 1. User Authentication & Account Management

Complete secure onboarding flow, credential validation, and session management.

- **Secure Signup & Login** — User account registration and authentication handling
- **Password Hashing** — Secure password storage using cryptographic hashing functions
- **Email Verification & OTP** — Sending verification emails, generating and validating One-Time Passwords, confirming email addresses to activate accounts
- **JWT Session Management** — Issuing JSON Web Tokens upon login for stateless authentication
- **Token Refresh & Revocation** — Refresh tokens to maintain sessions safely; revoking old tokens and handling secure logouts
- **Forgot Password Workflow** — Complete multi-step recovery flow allowing users to safely reset forgotten passwords

---

### 👤 2. User Profile & Role Management

Features related to managing user data, access tiers, and custom metadata.

- **Role-Based Access Control (RBAC)** — Detecting user roles and signature levels; admin dashboard management using `Promise.allSettled`; dynamically changing a user's system role
- **Profile & Cover Image Management** — Uploading and updating profile pictures and cover photos; automated cleanup via Node events to delete old images when replaced or removed
- **Global Request Object Enhancement** — Extending the Express Request interface (`Express Request` vs `IRequest` vs `Global Request`) to inject authenticated user data and authorization metadata seamlessly into route handlers

---

### 📰 3. Feed & Post System

The core content engine of the application, managing user posts and feed optimization.

- **Post Creation & Validation** — Building post data models and implementing request validations before publishing
- **Post Availability Control** — Managing public visibility states and structural access conditions for posts
- **Post Modification** — Updating posts using multiple backend approaches (In-Memory handling vs dual database requests); optimized production approach using MongoDB/Mongoose Aggregation Pipelines
- **Feed Pagination** — High-performance retrieval of posts utilizing pagination to limit payload sizes and boost loading speeds
- **Engagement Metrics** — Implementing interactive Like and Unlike capabilities on posts using automated database hooks

---

### 💬 4. Comment & Interaction System

Features that allow users to converse and engage underneath published content.

- **Multi-Level Commenting** — Creating top-level comments on posts; replying directly to comments and nesting replies on existing replies
- **Route Parameter Merging** — Leveraging Express `mergeParams` to cleanly handle nested routing architecture (e.g., `/posts/:postId/comments`)
- **Optimized Performance Queries** — Fetching posts along with their associated comments using high-efficiency techniques like Virtual Populate and streaming vs in-memory handling

---

### 🤝 5. Social Connections & Real-Time Chat

The networking layer, transitioning the application from static data into live, real-time interactivity.

- **Friendship Lifecycle** — System to send, receive, accept, and process friend requests between users
- **Real-Time Architecture Engine** — Full integration of Socket.io to establish persistent, bidirectional communication channels
- **Interactive Handshakes & Middleware** — Authenticating and securing socket connections during the initial handshake, with specialized WebSocket error handling
- **Event-Driven Communication Mechanics** — Advanced event dispatching styles: Emit (targeted), Broadcast (everyone except sender), `io.emit` (global), and socket / io-except-emit patterns
- **Multiplexing (Namespaces)** — Splitting socket communication into dedicated channels to organize logic (e.g., isolating chat traffic from global notification rings)
- **Delivery Acknowledgments (ACK)** — Utilizing Socket acknowledgments to ensure reliable communication
- **Chat User Directory** — Frontend integration fetching a list of active chat participants, matching real-time statuses with user profile imagery

---

### ☁️ 6. Cloud Storage & Asset Management (AWS S3)

The file processing pipeline built to handle media uploads efficiently without blocking server execution threads.

- **Multer Storage Architecture** — Implementing and evaluating file upload storage layers (Disk Storage vs Memory Storage); temporary OS storage staging for offloading large file processing
- **File Constraints** — Hard enforcement of file size limitations and file extension type validation
- **AWS S3 Bucket Integration** — Directly configuring secure cloud bucket connections
- **Optimized Upload Mechanics** — Handling standard uploads via `PutObjectCommand`; handling chunked processing for large assets
- **Secure Access via Pre-signed URLs** — Generating `preUploadSignedUrl` to let clients upload large media files directly to S3, bypassing backend bandwidth; generating `getAsset` pre-signed URLs to stream or securely download private assets
- **File & Folder Purging** — Single asset deletion, batch file deletion, and directory purging utilizing S3 prefix-matching patterns
- **Soft vs Hard Deletion** — Balancing data safety with permanent storage cleanup using soft-restore logic paired alongside definitive hard deletes

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
│   ├── modules/
│   │   └── auth/
│   │       ├── auth.controller.ts     # Route definitions
│   │       ├── auth.service.ts        # Business logic
│   │       ├── auth.validation.ts     # Zod schemas
│   │       └── auth.dto.ts            # Input type interfaces
│   ├── utils/
│   │   ├── response/
│   │   │   └── error.response.ts      # Exception classes + global error handler
│   │   └── security/                  # (upcoming)
│   ├── app.controller.ts              # Express bootstrap — middleware, routing
│   └── index.ts                       # Entry point
├── .env
├── .gitignore
├── tsconfig.json
├── package.json
└── README.md
```

---

## Security Design

- **Helmet** — secure HTTP headers on every response
- **CORS** — enabled globally
- **Rate Limiting** — 200 requests per hour per IP; excess returns `429` with a JSON error body
- **Zod** — strict schema validation on every request; unknown fields rejected at the boundary
- **Password policy** — min 8 chars, uppercase, lowercase, digit, and special character required
- **Phone validation** — Egyptian numbers only (`010 / 011 / 012 / 015`)

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
  "username": "ahmed_essam",
  "email": "ahmed@example.com",
  "password": "Ahmed@1234",
  "phone": "01012345678"
}
```

**Validation**

| Field | Rules |
|---|---|
| `username` | Required · 3–20 chars |
| `email` | Required · valid email |
| `password` | Required · min 8 chars · uppercase, lowercase, digit, special char |
| `phone` | Required · Egyptian numbers only: `010 / 011 / 012 / 015` |

**Responses**

| Status | Description |
|---|---|
| `201` | User registered successfully |
| `400` | Validation error |

</details>

---

<details>
<summary><code>POST</code> &nbsp; <code>/auth/login</code> &nbsp;—&nbsp; Login with credentials</summary>

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

## Deployment

> To be documented once the application is hosted.

---

## 👨‍💻 Author

**Ahmed Essam** — Node.js Backend Engineer

📩 ahmedezsam@gmail.com · 🔗 [LinkedIn](https://linkedin.com/in/ahmed-essam-33b989221)

---

<div align="center">
<sub>Built with TypeScript, clean architecture, and strong opinions ☕</sub>
</div>
