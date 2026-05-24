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

- Express app bootstrapped with TypeScript — global middleware stack: `cors()`, `express.json()`, `helmet()`, `express-rate-limit` (200 req/hr per IP)
- Typed exception hierarchy — `ApplicationException` base class with `BadRequestException` (400), `NotFoundException` (404), `ConflictException` (409)
- Global error handler middleware returning structured JSON with `err_message`, `stack`, and `cause`
- Invalid route handler returning a structured `404` for all unmatched routes
- Auth module scaffold — `POST /signup` and `POST /login` wired to a typed `AuthenticationService` class
- Zod strict validation schemas — strong password regex, Egyptian phone regex, unknown fields rejected at boundary
- `ISignupBodyInputsDto` typed interface — contract between validation and service layers

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Runtime | Node.js |
| Framework | Express.js |
| Validation | Zod |
| Security | CORS · Helmet · express-rate-limit |
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
- **Password policy** — min 8 chars, uppercase, lowercase, digit, and special character enforced via regex
- **Phone validation** — Egyptian numbers only (`010 / 011 / 012 / 015`) enforced via regex

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
- `ISignupBodyInputsDto` typed interface; service handlers are class methods with full typing
- No DB connection yet — service layer returns scaffold responses

---

## 👨‍💻 Author

**Ahmed Essam** — Node.js Backend Engineer

📩 ahmedezsam@gmail.com · 🔗 [LinkedIn](https://linkedin.com/in/ahmed-essam-33b989221)

---

<div align="center">
<sub>Built with TypeScript, clean architecture, and strong opinions ☕</sub>
</div>
