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
- [Security Design](#security-design)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Author](#author)

---

## Overview

A social media REST API built from the ground up with **TypeScript**, **Node.js**, **Express.js**, and **MongoDB**. Every module is self-contained, every input is validated at runtime with **Zod**, and the codebase is fully typed for reliability and developer confidence.

**Core flow so far:**

1. Server bootstraps with CORS, Helmet, rate limiting, and JSON parsing applied globally
2. Requests are routed into self-contained modules (`auth`, with more to follow)
3. All inputs are validated via Zod schemas before reaching the service layer
4. A typed exception hierarchy handles errors uniformly across the entire application
5. Invalid routes return a structured `404` — no silent failures

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Validation | Zod |
| Auth | JWT · Google OAuth *(upcoming)* |
| Security | bcryptjs · CryptoJS (AES) · CORS · Helmet · express-rate-limit |
| Email | Nodemailer + Node EventEmitter *(upcoming)* |
| File Upload | Multer + Cloudinary *(upcoming)* |
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

- **Helmet** — sets secure HTTP headers on every response
- **CORS** — enabled globally via `cors()` middleware
- **Rate Limiting** — `express-rate-limit` caps each IP at 200 requests per hour; excess requests return `429 Too Many Requests` with a JSON error body
- **Zod** — strict runtime schema validation on every incoming request body; unknown fields are rejected via `z.strictObject()`
- **Password policy** — enforced at validation layer: min 8 chars, uppercase, lowercase, digit, and special character required
- **Phone validation** — Egyptian numbers only (`010 / 011 / 012 / 015`) enforced via regex at the schema level

> JWT, bcrypt, AES encryption, and OTP verification — coming in the next checkpoint.

---

## API Reference

**Base URL:** `http://localhost:5000`

> All routes return `400 Validation Error` on invalid input.

### Auth — `/auth`

| Method | Route | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/signup` | Register a new user | — |
| `POST` | `/auth/login` | Login with credentials | — |

> More endpoints coming as features are added.

---

## Deployment

> To be documented once the application is hosted.

---

## 📍 Checkpoint — What's Done

> **Last updated:** Initial project scaffold
> Use this section as a reference when resuming — paste it at the start of your next prompt.

### ✅ Completed

**Project Bootstrap**
- Express app initialized with full TypeScript configuration (`tsconfig.json`, typed `Request`/`Response` throughout)
- Global middleware stack: `cors()`, `express.json()`, `helmet()`, `express-rate-limit` (200 req/hr per IP)
- Entry point (`index.ts`) loads `dotenv` and calls `bootstrap()`
- Invalid route handler — catches all unmatched routes with a structured `404` JSON response
- Global async error handler middleware with typed `IError` interface

**Error Handling Architecture**
- `ApplicationException` — base typed exception class with `statusCode`, `message`, and `cause`
- `BadRequestException` (400), `NotFoundException` (404), `ConflictException` (409) — all extend base
- `globalErrorHandling` middleware returns structured JSON with `err_message`, `stack`, and `cause`

**Auth Module — `/auth`**
- `auth.controller.ts` — Router with `POST /signup` and `POST /login` wired to service
- `auth.service.ts` — `AuthenticationService` class with `signup` and `login` handlers (scaffold, no DB yet)
- `auth.dto.ts` — `ISignupBodyInputsDto` interface (`username`, `email`, `password`)
- `auth.validation.ts` — Zod strict schemas: `username` (3–20 chars), `email`, `password` (strong regex), `phone` (Egyptian numbers)

### 🔜 Not Started Yet
- Zod validation middleware (schema → route wiring)
- MongoDB connection + Mongoose models (User, Token)
- Auth logic: signup with OTP, login with JWT, Google OAuth
- Password hashing (bcrypt), AES field encryption, token blacklist
- User module, Post module
- File uploads (Multer + Cloudinary)
- Email service (Nodemailer + EventEmitter)
- Deployment (AWS EC2, Nginx, PM2)

---

## 👨‍💻 Author

**Ahmed Essam** — Node.js Backend Engineer

📩 ahmedezsam@gmail.com · 🔗 [LinkedIn](https://linkedin.com/in/ahmed-essam-33b989221)

---

<div align="center">
<sub>Built with TypeScript, clean architecture, and strong opinions ☕</sub>
</div>
