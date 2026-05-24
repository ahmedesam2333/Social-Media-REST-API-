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

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Security Design](#security-design)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Author](#author)

---

## Features

### 🏗️ Application Bootstrap

- Express app fully initialized with TypeScript — all handlers typed via `Request`, `Response`, `NextFunction`
- Global middleware stack: `cors()`, `express.json()`, `helmet()`, `express-rate-limit` (200 req/hr per IP with JSON error body on `429`)
- Root health-check route returning a welcome JSON response
- Invalid route handler — catches all unmatched routes and returns a structured `404` JSON response
- `dotenv` loaded at entry point before any module initializes

### 🚨 Error Handling Architecture

- `ApplicationException` — base typed exception class with `statusCode`, `message`, and `cause` support
- Semantic exception subclasses: `BadRequestException` (400), `NotFoundException` (404), `ConflictException` (409)
- `globalErrorHandling` middleware — returns structured JSON with `err_message`, `stack`, and `cause` on every unhandled throw

### 🔐 Auth Module — `/auth`

- `POST /auth/signup` — accepts `username`, `email`, `password`, `phone` with full Zod strict validation
- `POST /auth/login` — scaffold route wired and ready for business logic
- Zod strict schemas (`z.strictObject`) — unknown fields rejected at the boundary; password enforced with uppercase, lowercase, digit, and special character regex; phone restricted to Egyptian numbers (`010 / 011 / 012 / 015`)
- `ISignupBodyInputsDto` interface — typed contract between validation layer and service layer
- `AuthenticationService` class — encapsulates all auth handlers as typed class methods

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
- **Zod** — strict runtime schema validation on every incoming request body; unknown fields rejected via `z.strictObject()`
- **Password policy** — min 8 chars, uppercase, lowercase, digit, and special character enforced via regex at the schema level
- **Phone validation** — Egyptian numbers only (`010 / 011 / 012 / 015`) enforced via regex

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

> More endpoints added as features are built.

---

## Deployment

> To be documented once the application is hosted.

---

## 📍 Checkpoint — What's Done

> **Last updated:** Initial project scaffold
> Use this section as context when resuming — share it at the start of your next prompt so nothing needs re-explaining.

### ✅ Completed

**Project Bootstrap**
- Express + TypeScript fully wired; `dotenv` loads at entry point; typed `bootstrap()` function
- Global middleware: `cors()`, `express.json()`, `helmet()`, `express-rate-limit` (200 req/hr per IP)
- Root route, invalid route handler (structured `404`), and global error handler all in place

**Error Handling**
- Base `ApplicationException` class with `statusCode`, `message`, `cause`
- `BadRequestException` (400), `NotFoundException` (404), `ConflictException` (409)
- `globalErrorHandling` Express middleware with structured JSON response

**Auth Module**
- `POST /signup` and `POST /login` routes wired to `AuthenticationService`
- Zod strict schemas: `username` (3–20 chars), `email`, strong `password` regex, Egyptian `phone` regex
- `ISignupBodyInputsDto` typed interface; service handlers are class methods with full `Request`/`Response` typing
- No DB connection yet — service layer returns scaffold responses

### 🔜 Not Started Yet
- Zod validation middleware (schema → route wiring)
- MongoDB connection + Mongoose models (User, Token)
- Auth logic: signup with OTP email verification, login with JWT, Google OAuth
- Password hashing (bcrypt), reuse prevention, AES field encryption, token blacklist
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
