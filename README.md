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

- 🏗️ Express + TypeScript bootstrap with global middleware (CORS, Helmet, rate limiting, JSON parsing)
- 🚨 Typed exception hierarchy with a global error handler and structured JSON error responses
- 🔐 Auth module with typed service layer, Zod strict validation, and DTO interfaces
- 🛡️ Input validation via Zod — strict schemas with strong password and phone rules enforced at the boundary

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

## 📍 Checkpoint — What's Done

> **Last updated:** Initial project scaffold
> Paste this section at the start of your next prompt to resume without re-explaining anything.

- Express + TypeScript fully bootstrapped; global middleware stack in place; `dotenv` loads at entry point
- Typed exception hierarchy: `ApplicationException`, `BadRequestException` (400), `NotFoundException` (404), `ConflictException` (409)
- `globalErrorHandling` middleware with structured JSON response (`err_message`, `stack`, `cause`)
- Invalid route handler — structured `404` for all unmatched routes
- Auth module: `POST /signup` and `POST /login` wired to `AuthenticationService` class
- Zod strict schemas for signup: `username`, `email`, strong `password` regex, Egyptian `phone` regex
- `ISignupBodyInputsDto` typed interface between validation and service layers
- No DB connection yet — service layer returns scaffold responses

---

## 👨‍💻 Author

**Ahmed Essam** — Node.js Backend Engineer

📩 ahmedezsam@gmail.com · 🔗 [LinkedIn](https://linkedin.com/in/ahmed-essam-33b989221)

---

<div align="center">
<sub>Built with TypeScript, clean architecture, and strong opinions ☕</sub>
</div>
