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
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Models](#database-models)
- [Security Design](#security-design)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Author](#author)

---

## Overview

A feature-rich social media REST API built from the ground up with **TypeScript**, **Node.js**, **Express.js**, and **MongoDB**. The project is architected for scalability — every module is self-contained, every input is validated, and every response is typed.

**Core flow:**

1. A user registers and verifies their email via OTP
2. They can create a profile, publish posts, and interact with others
3. Authentication is handled via JWT access and refresh tokens
4. Admins have elevated controls for moderation and account management
5. The codebase is fully typed with TypeScript for reliability and developer confidence

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | **TypeScript** |
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Validation | **Zod** |
| Auth | JWT (access & refresh tokens), Google OAuth |
| Security | bcryptjs, CryptoJS (AES), CORS, Helmet, express-rate-limit |
| Email | Nodemailer + Node EventEmitter |
| File Upload | Multer + Cloudinary |
| OTP | nanoid (`customAlphabet`) |
| Config | dotenv |
| Logging | Winston / Morgan |
| Process Manager | PM2 (cluster mode) |
| Web Server | Nginx (reverse proxy) |
| Cloud Infrastructure | AWS EC2, Elastic IP |

---

## Project Structure

```
SOCIAL-MEDIA-APP/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.validation.ts
│   │   ├── user/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── user.validation.ts
│   │   │   └── user.authorization.ts
│   │   └── post/
│   │       ├── post.controller.ts
│   │       ├── post.routes.ts
│   │       └── post.validation.ts
│   ├── DB/
│   │   ├── models/
│   │   │   ├── user.model.ts
│   │   │   ├── token.model.ts
│   │   │   └── post.model.ts
│   │   ├── db.service.ts
│   │   └── connection.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── validation.middleware.ts
│   ├── types/
│   │   ├── express.d.ts
│   │   ├── env.d.ts
│   │   └── index.ts
│   └── utils/
│       ├── response.ts
│       ├── multer/
│       │   ├── local.multer.ts
│       │   ├── cloud.multer.ts
│       │   └── cloudinary.ts
│       ├── email/
│       │   ├── send.email.ts
│       │   └── templates/
│       │       └── email.template.ts
│       ├── events/
│       │   └── email.event.ts
│       └── security/
│           ├── hash.security.ts
│           ├── encrypt.security.ts
│           ├── otp.security.ts
│           └── token.security.ts
│   ├── app.controller.ts
│   └── index.ts
├── .gitignore
├── .env.example
├── tsconfig.json
├── package.json
└── README.md
```

---

## Database Models

### User — `src/DB/models/user.model.ts`

| Field | Type | Notes |
|---|---|---|
| `firstName` / `lastName` | String | Required · 2–20 chars each |
| `fullName` | Virtual | Getter/setter that splits first and last name |
| `email` | String | Required · Unique |
| `password` | String | Required for `system` provider · bcrypt hashed |
| `oldPasswords` | String[] | Stores previous hashed passwords to prevent reuse |
| `phone` | String | AES encrypted at rest |
| `gender` | `'male' \| 'female'` | Default: `male` |
| `role` | `'user' \| 'admin'` | Default: `user` |
| `provider` | `'system' \| 'google'` | Default: `system` |
| `picture` | Object | `{ secure_url, public_id }` — Cloudinary |
| `coverImages` | Object[] | Array of `{ secure_url, public_id }` — Cloudinary |
| `confirmEmail` | Date | Set on verification; absent means unverified |
| `confirmEmailOtp` | String | Hashed · removed after verification |
| `forgetPasswordOtp` | String | Hashed · removed after reset |
| `otpDate` | Date | OTP timestamp — drives the 2-minute expiry logic |
| `changeCredentialsTime` | Date | Updated on password reset / logout-all |
| `deletedAt` / `deletedBy` | Date / ObjectId | Soft-delete fields |
| `restoredAt` / `restoredBy` | Date / ObjectId | Restore audit fields |

---

### Token Blacklist — `src/DB/models/token.model.ts`

| Field | Type | Notes |
|---|---|---|
| `jti` | String | Required · Unique — JWT ID |
| `expiresIn` | Number | Unix timestamp |
| `userId` | ObjectId | Required · Ref: `User` |

---

## Security Design

- **Passwords** — bcrypt hashed; previous passwords stored to prevent reuse
- **Phone numbers** — AES encrypted at rest, decrypted only on profile fetch
- **OTPs** — bcrypt hashed with a 2-minute expiry; resend cooldown enforced
- **JWT** — Access and refresh token pair with unique `jti` per token; single-session and global revocation supported
- **Google OAuth** — ID token verified server-side; unified signup/login flow
- **Zod** — Full runtime type validation on every incoming request, with strongly typed schemas
- **Helmet** — Secure HTTP headers on every response
- **Rate Limiting** — 2,000 requests per hour per IP; excess returns `429 Too Many Requests`

---

## API Reference

> 🔒 Protected routes require `Authorization: Bearer <token>` (users) or `Authorization: Admin <token>` (admins)
>
> All routes return `400 Validation Error` on invalid input — omitted per endpoint for brevity.

### Auth — `/auth`

| Method | Route | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/signup` | Register a new user | — |
| `POST` | `/auth/login` | Login with credentials | — |
| `POST` | `/auth/gmail` | Signup or login with Google | — |
| `PATCH` | `/auth/confirm-email` | Verify email with OTP | — |
| `PATCH` | `/auth/resend-otp` | Resend verification OTP | — |
| `PATCH` | `/auth/forget-password` | Request password reset OTP | — |
| `PATCH` | `/auth/verify-forget-password` | Verify reset OTP | — |
| `PATCH` | `/auth/reset-password` | Set a new password | — |

### User — `/user`

| Method | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/user` | Get current user profile | 🔒 |
| `PATCH` | `/user` | Update basic profile | 🔒 |
| `PATCH` | `/user/password` | Change password | 🔒 |
| `PATCH` | `/user/profile-image` | Upload profile image | 🔒 |
| `PATCH` | `/user/profile-cover-images` | Upload cover images | 🔒 |
| `GET` | `/user/refresh-token` | Rotate token pair | 🔒 |
| `POST` | `/user/logout` | Logout (single or all sessions) | 🔒 |
| `GET` | `/user/:userId` | View public profile | — |
| `DELETE` | `/user/:userId/freeze-account` | Freeze account (soft-delete) | 🔒 |
| `PATCH` | `/user/:userId/restore-account` | Restore frozen account | 🔒 Admin |
| `DELETE` | `/user/:userId` | Hard delete account | 🔒 Admin |

---

## Deployment

> Deployment details will be added once the application is hosted.

Planned infrastructure:

- **AWS EC2** — Ubuntu server with Elastic IP
- **Nginx** — Reverse proxy routing traffic to the Node.js process
- **PM2** — Cluster mode with crash recovery and boot persistence
- **Security Groups** — Inbound rules for HTTP (80), HTTPS (443), SSH (22)

---

## 👨‍💻 Author

**Ahmed Essam** — Node.js Backend Engineer

📩 ahmedezsam@gmail.com · 🔗 [LinkedIn](https://linkedin.com/in/ahmed-essam-33b989221)

---

<div align="center">
<sub>Built with TypeScript, clean architecture, and strong opinions ☕</sub>
</div>
