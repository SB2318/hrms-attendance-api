# HRMS Attendance Management API

A production-style backend service for managing employee attendance, authentication, authorization, employee management, and attendance reporting.

The project is implemented using **Node.js, TypeScript, Express.js, PostgreSQL, Prisma, and JWT authentication**.

---

## Table of Contents

* [Overview](#overview)
* [Features](#features)
* [Technology Stack](#technology-stack)
* [Architecture](#architecture)
* [Project Structure](#project-structure)
* [Prerequisites](#prerequisites)
* [Installation](#installation)
* [Environment Variables](#environment-variables)
* [Database Setup](#database-setup)
* [Database Design](#database-design)
* [Running the Application](#running-the-application)
* [Authentication](#authentication)
* [API Documentation](#api-documentation)

  * [Health Check](#1-health-check)
  * [Login](#2-login)
  * [Create Employee](#3-create-employee)
  * [Get Employees](#4-get-employees)
  * [Get Employee](#5-get-employee)
  * [Update Employee](#6-update-employee)
  * [Delete Employee](#7-delete-employee)
  * [Punch In](#8-punch-in)
  * [Punch Out](#9-punch-out)
  * [My Attendance](#10-my-attendance)
  * [Admin Attendance Report](#11-admin-attendance-report)
* [Authorization Rules](#authorization-rules)
* [Attendance Business Rules](#attendance-business-rules)
* [Concurrency and Duplicate Request Handling](#concurrency-and-duplicate-request-handling)
* [Validation](#validation)
* [Error Handling](#error-handling)
* [Testing](#testing)
* [Security](#security)
* [Development](#development)
* [Production Build](#production-build)
* [Known Limitations and Assumptions](#known-limitations-and-assumptions)
* [Future Improvements](#future-improvements)

---

# Overview

The HRMS Attendance Management API provides REST APIs for:

* Employee authentication
* JWT-based authorization
* Admin employee management
* Employee punch-in
* Employee punch-out
* Employee attendance history
* Admin attendance reports
* Date-range attendance filtering
* Employee-based attendance filtering

The application is designed to maintain data consistency even when multiple punch-in requests arrive concurrently.

---

# Features

## Authentication

* JWT-based authentication
* Secure password hashing using bcrypt
* Protected API endpoints
* Token validation on every protected request
* ADMIN and EMPLOYEE roles

## Employee Management

Admins can:

* Create employees
* View all employees
* View an individual employee
* Update employees
* Delete employees

## Attendance

Authenticated employees can:

* Punch in
* Punch out
* View their own attendance history

## Attendance Reports

Admins can:

* View attendance reports
* Filter by employee
* Filter by date range
* View employee name and employee code
* View punch-in and punch-out times
* View total working hours

## Data Consistency

The system uses:

* PostgreSQL unique constraints
* Foreign keys
* Database indexes
* Transactions where appropriate
* Application-level validation
* Database-level duplicate protection

---

# Technology Stack

| Technology | Purpose                      |
| ---------- | ---------------------------- |
| Node.js    | Runtime                      |
| TypeScript | Type safety                  |
| Express.js | HTTP server/framework        |
| PostgreSQL | Relational database          |
| Prisma     | ORM and database access      |
| JWT        | Authentication               |
| bcrypt     | Password hashing             |
| Zod        | Request validation           |
| Jest       | Testing                      |
| Supertest  | HTTP/API testing             |
| Docker     | Local PostgreSQL environment |

---

# Architecture

The application follows a layered architecture.

```text
Client
  |
  v
Routes
  |
  v
Middleware
  |
  +--> JWT Authentication
  |
  +--> Role Authorization
  |
  +--> Request Validation
  |
  v
Controllers
  |
  v
Services
  |
  v
Repositories
  |
  v
Prisma
  |
  v
PostgreSQL
```

## Responsibilities

### Routes

Responsible for:

* Defining HTTP endpoints
* Connecting middleware
* Connecting controllers

### Middleware

Responsible for:

* JWT verification
* Role-based authorization
* Request validation
* Global error handling

### Controllers

Responsible for:

* Reading request data
* Calling services
* Returning HTTP responses

### Services

Responsible for:

* Business logic
* Attendance rules
* Employee rules
* Concurrency handling

### Repositories

Responsible for:

* Database queries
* Prisma operations
* Data access abstraction

### Database

Responsible for:

* Persistent storage
* Unique constraints
* Foreign keys
* Referential integrity

---

# Project Structure

```text
src/
├── config/
│   ├── env.ts
│   └── database.ts
│
├── controllers/
│   ├── auth.controller.ts
│   ├── employee.controller.ts
│   └── attendance.controller.ts
│
├── middleware/
│   ├── auth.middleware.ts
│   ├── role.middleware.ts
│   ├── validate.middleware.ts
│   └── error.middleware.ts
│
├── repositories/
│   ├── employee.repository.ts
│   └── attendance.repository.ts
│
├── routes/
│   ├── auth.routes.ts
│   ├── employee.routes.ts
│   └── attendance.routes.ts
│
├── services/
│   ├── auth.service.ts
│   ├── employee.service.ts
│   └── attendance.service.ts
│
├── schemas/
│   ├── auth.schema.ts
│   ├── employee.schema.ts
│   └── attendance.schema.ts
│
├── types/
│   └── auth.types.ts
│
├── utils/
│   ├── jwt.ts
│   ├── password.ts
│   └── response.ts
│
├── app.ts
└── server.ts

prisma/
├── schema.prisma
└── migrations/

tests/
├── auth.test.ts
├── employee.test.ts
└── attendance.test.ts
```

---

# Prerequisites

Make sure the following are installed:

* Node.js
* pnpm
* PostgreSQL OR Docker
* Git

Check:

```bash
node --version
pnpm --version
docker --version
git --version
```

---

# Installation

Clone the repository:

```bash
git clone <repository-url>
```

Enter the project:

```bash
cd hrms-attendance-api
```

Install dependencies:

```bash
pnpm install
```

---

# Environment Variables

Create a `.env` file in the project root.

```env
PORT=5000

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hrms"

JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="1d"

NODE_ENV="development"
```

A `.env.example` file is included in the repository.

Example:

```env
PORT=5000
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=1d
NODE_ENV=development
```

Never commit `.env` or production secrets.

---

# Database Setup

## Option 1: Docker

Start PostgreSQL:

```bash
docker compose up -d
```

Check the container:

```bash
docker ps
```

---

## Prisma Migration

Run:

```bash
pnpm exec prisma migrate dev --name init
```

Generate Prisma Client:

```bash
pnpm exec prisma generate
```

---

# Database Design

The system uses two main tables.

```text
Employee
   |
   | 1:N
   |
   v
Attendance
```

## Employee

Important fields:

```text
id
name
email
password_hash
role
employee_code
created_at
updated_at
```

## Attendance

Important fields:

```text
id
employee_id
date
punch_in
punch_out
created_at
updated_at
```

The `employee_id` column is a foreign key referencing `employees.id`.

The following combination is unique:

```text
employee_id + date
```

This prevents multiple attendance records for the same employee on the same attendance date.

---

# Seed Admin

A development seed can be used to create an initial ADMIN account.

Example development credentials:

```text
Email: admin@example.com
Password: Admin@12345
```

These credentials are intended only for local development/testing.

Run:

```bash
pnpm exec tsx prisma/seed.ts
```

Do not use these credentials in a production environment.

---

# Running the Application

## Development

```bash
pnpm dev
```

The API will run on:

```text
http://localhost:5000
```

---

## Production Build

Build:

```bash
pnpm build
```

Start:

```bash
pnpm start
```

---

# Authentication

The API uses JWT Bearer authentication.

After successful login, the API returns a JWT.

Use the token in protected requests:

```http
Authorization: Bearer <JWT_TOKEN>
```

The server validates the JWT before processing protected operations.

The authenticated employee identity is taken from the JWT rather than from an `employeeId` supplied by the client.

Example JWT payload:

```json
{
  "employeeId": 10,
  "role": "EMPLOYEE"
}
```

---

# API Documentation

Base URL:

```text
http://localhost:5000/api
```

---

# 1. Health Check

Checks whether the API is running.

### Endpoint

```http
GET /health
```

### Authentication

Not required.

### Response

```json
{
  "success": true,
  "message": "API is healthy"
}
```

---

# 2. Login

Authenticates a registered employee and returns a JWT.

### Endpoint

```http
POST /api/auth/login
```

### Authentication

Not required.

### Request

```json
{
  "email": "admin@example.com",
  "password": "Admin@12345"
}
```

### Success Response

```json
{
  "success": true,
  "data": {
    "token": "<JWT_TOKEN>",
    "employee": {
      "id": 1,
      "name": "System Admin",
      "email": "admin@example.com",
      "role": "ADMIN",
      "employeeCode": "ADMIN001"
    }
  }
}
```

### Possible Errors

#### Invalid credentials

```http
401 Unauthorized
```

```json
{
  "success": false,
  "message": "Invalid email or password."
}
```

#### Invalid request

```http
400 Bad Request
```

---

# 3. Create Employee

Creates a new employee.

### Endpoint

```http
POST /api/employees
```

### Authentication

Required.

### Role

```text
ADMIN
```

### Headers

```http
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

### Request

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "Password@123",
  "role": "EMPLOYEE",
  "employeeCode": "EMP001"
}
```

### Success

```http
201 Created
```

```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Alice",
    "email": "alice@example.com",
    "role": "EMPLOYEE",
    "employeeCode": "EMP001"
  }
}
```

The password hash is never returned.

### Errors

```text
400 → Invalid request
401 → Missing/invalid JWT
403 → User is not ADMIN
409 → Email or employee code already exists
```

---

# 4. Get Employees

Returns all employees.

### Endpoint

```http
GET /api/employees
```

### Authentication

Required.

### Role

```text
ADMIN
```

### Headers

```http
Authorization: Bearer <ADMIN_TOKEN>
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "System Admin",
      "email": "admin@example.com",
      "role": "ADMIN",
      "employeeCode": "ADMIN001"
    },
    {
      "id": 2,
      "name": "Alice",
      "email": "alice@example.com",
      "role": "EMPLOYEE",
      "employeeCode": "EMP001"
    }
  ]
}
```

### Errors

```text
401 → Unauthorized
403 → Forbidden
```

---

# 5. Get Employee

Returns a specific employee.

### Endpoint

```http
GET /api/employees/:id
```

### Example

```http
GET /api/employees/2
```

### Authentication

Required.

### Role

```text
ADMIN
```

### Response

```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Alice",
    "email": "alice@example.com",
    "role": "EMPLOYEE",
    "employeeCode": "EMP001"
  }
}
```

### Errors

```text
401 → Unauthorized
403 → Forbidden
404 → Employee not found
```

---

# 6. Update Employee

Updates employee information.

### Endpoint

```http
PUT /api/employees/:id
```

### Example

```http
PUT /api/employees/2
```

### Authentication

Required.

### Role

```text
ADMIN
```

### Request

```json
{
  "name": "Alice Updated",
  "email": "alice.updated@example.com",
  "employeeCode": "EMP001"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Alice Updated",
    "email": "alice.updated@example.com",
    "role": "EMPLOYEE",
    "employeeCode": "EMP001"
  }
}
```

### Errors

```text
400 → Invalid request
401 → Unauthorized
403 → Forbidden
404 → Employee not found
409 → Email/employee code conflict
```

---

# 7. Delete Employee

Deletes an employee.

### Endpoint

```http
DELETE /api/employees/:id
```

### Example

```http
DELETE /api/employees/2
```

### Authentication

Required.

### Role

```text
ADMIN
```

### Response

```json
{
  "success": true,
  "message": "Employee deleted successfully."
}
```

### Errors

```text
401 → Unauthorized
403 → Forbidden
404 → Employee not found
```

---

# 8. Punch In

Creates the employee's attendance record for the current attendance date.

### Endpoint

```http
POST /api/attendance/punch-in
```

### Authentication

Required.

### Role

```text
EMPLOYEE
```

### Headers

```http
Authorization: Bearer <EMPLOYEE_TOKEN>
```

### Request Body

No employee ID is required.

```json
{}
```

The employee is identified from the JWT.

### Success

```http
201 Created
```

```json
{
  "success": true,
  "data": {
    "id": 10,
    "employeeId": 2,
    "date": "2026-09-01T00:00:00.000Z",
    "punchIn": "2026-09-01T09:15:00.000Z",
    "punchOut": null
  }
}
```

### Duplicate Punch-In

```http
409 Conflict
```

```json
{
  "success": false,
  "message": "Employee has already punched in."
}
```

### Important

The API does not trust:

```json
{
  "employeeId": 999
}
```

from the client.

The employee ID is obtained from the verified JWT.

---

# 9. Punch Out

Records the employee's punch-out time.

### Endpoint

```http
POST /api/attendance/punch-out
```

### Authentication

Required.

### Role

```text
EMPLOYEE
```

### Headers

```http
Authorization: Bearer <EMPLOYEE_TOKEN>
```

### Request Body

No employee ID is required.

```json
{}
```

### Success

```http
200 OK
```

```json
{
  "success": true,
  "data": {
    "id": 10,
    "employeeId": 2,
    "date": "2026-09-01T00:00:00.000Z",
    "punchIn": "2026-09-01T09:15:00.000Z",
    "punchOut": "2026-09-01T18:10:00.000Z"
  }
}
```

### Punch-Out Before Punch-In

```http
400 Bad Request
```

```json
{
  "success": false,
  "message": "Cannot punch out before punching in."
}
```

### Duplicate Punch-Out

```http
409 Conflict
```

```json
{
  "success": false,
  "message": "Employee has already punched out."
}
```

---

# 10. My Attendance

Returns attendance history for the authenticated employee.

### Endpoint

```http
GET /api/attendance/my
```

### Authentication

Required.

### Role

```text
EMPLOYEE
```

### Headers

```http
Authorization: Bearer <EMPLOYEE_TOKEN>
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "date": "2026-09-01",
      "punchIn": "2026-09-01T09:15:00.000Z",
      "punchOut": "2026-09-01T18:10:00.000Z"
    },
    {
      "id": 9,
      "date": "2026-08-31",
      "punchIn": "2026-08-31T09:05:00.000Z",
      "punchOut": "2026-08-31T18:00:00.000Z"
    }
  ]
}
```

The API derives the employee from the JWT.

An employee cannot request another employee's attendance by supplying another employee ID.

---

# 11. Admin Attendance Report

Returns attendance records for administrative reporting.

### Endpoint

```http
GET /api/admin/attendance
```

### Authentication

Required.

### Role

```text
ADMIN
```

### Date Range

```http
GET /api/admin/attendance?from=2026-08-01&to=2026-08-31
```

### Employee Filter

```http
GET /api/admin/attendance?employeeId=2
```

### Combined Filter

```http
GET /api/admin/attendance?employeeId=2&from=2026-08-01&to=2026-08-31
```

### Query Parameters

| Parameter    | Required | Description        |
| ------------ | -------- | ------------------ |
| `from`       | No       | Start date         |
| `to`         | No       | End date           |
| `employeeId` | No       | Filter by employee |

### Response

```json
{
  "success": true,
  "data": [
    {
      "employeeName": "Alice",
      "employeeCode": "EMP001",
      "date": "2026-08-20",
      "punchIn": "2026-08-20T09:01:00.000Z",
      "punchOut": "2026-08-20T18:03:00.000Z",
      "totalWorkingHours": "09:02"
    }
  ]
}
```

If an employee has not punched out:

```json
{
  "employeeName": "Alice",
  "employeeCode": "EMP001",
  "date": "2026-08-20",
  "punchIn": "2026-08-20T09:01:00.000Z",
  "punchOut": null,
  "totalWorkingHours": null
}
```

---

# Authorization Rules

| Operation               | ADMIN | EMPLOYEE |
| ----------------------- | ----: | -------: |
| Login                   |   Yes |      Yes |
| Create employee         |   Yes |       No |
| View employees          |   Yes |       No |
| View employee           |   Yes |       No |
| Update employee         |   Yes |       No |
| Delete employee         |   Yes |       No |
| Punch in                |    No |      Yes |
| Punch out               |    No |      Yes |
| View own attendance     |    No |      Yes |
| Admin attendance report |   Yes |       No |

All protected endpoints require a valid JWT.

---

# Attendance Business Rules

The following rules are enforced:

1. An employee cannot create multiple punch-in records for the same attendance session.

2. Punch-out cannot happen before punch-in.

3. Punch-out cannot be performed twice for the same attendance session.

4. Employees cannot access another employee's attendance.

5. Employee identity is obtained from the verified JWT.

6. Invalid requests return meaningful HTTP status codes.

7. The database prevents duplicate attendance records for the same employee and date.

---

# Concurrency and Duplicate Request Handling

Mobile applications can retry requests or send duplicate requests.

For example:

```text
Request 1 → Punch In
Request 2 → Punch In
Request 3 → Punch In
```

These requests may arrive almost simultaneously.

A simple application-level check such as:

```text
SELECT attendance
IF attendance does not exist
    INSERT attendance
```

is not sufficient because of a check-then-insert race condition.

Two requests could both observe that no record exists.

## Database Constraint

The database contains a unique constraint:

```text
(employee_id, date)
```

Therefore, PostgreSQL permits only one attendance record for an employee on a particular attendance date.

Conceptually:

```text
Request A
   |
   +---- INSERT → SUCCESS

Request B
   |
   +---- INSERT → UNIQUE CONSTRAINT ERROR
                         |
                         v
                    HTTP 409
```

The application handles the database unique constraint error and converts it into a meaningful response:

```json
{
  "success": false,
  "message": "Employee has already punched in."
}
```

This makes the database the final authority for duplicate prevention.

## Concurrency Test

The automated test sends multiple punch-in requests concurrently:

```text
10 simultaneous requests
        |
        v
     Promise.all()
        |
        v
Only one successful creation
        |
        v
Exactly one attendance record
```

This demonstrates that the implementation is safe against concurrent duplicate requests.

---

# Validation

Incoming request data is validated before business logic is executed.

Examples of validation include:

* Valid email format
* Required employee name
* Minimum password length
* Valid role
* Valid employee code
* Valid date parameters

Invalid requests return a `400 Bad Request` response.

Example:

```json
{
  "success": false,
  "message": "Validation failed"
}
```

---

# Error Handling

The application uses centralized error handling.

Errors are returned using a consistent format:

```json
{
  "success": false,
  "message": "Error message"
}
```

Common HTTP status codes:

| Status | Meaning                         |
| ------ | ------------------------------- |
| `200`  | Successful operation            |
| `201`  | Resource created                |
| `400`  | Invalid request                 |
| `401`  | Authentication required/invalid |
| `403`  | Insufficient permissions        |
| `404`  | Resource not found              |
| `409`  | Resource conflict               |
| `500`  | Internal server error           |

Production responses do not expose:

* Stack traces
* Database credentials
* SQL queries
* Internal implementation details
* Secrets

---

# Testing

The project uses Jest and Supertest.

Run tests:

```bash
pnpm test
```

Run tests in watch mode:

```bash
pnpm test -- --watch
```

Run with coverage:

```bash
pnpm test -- --coverage
```

## Critical Test Cases

The test suite covers:

### Authentication

* Successful login
* Invalid credentials
* Unauthorized API access

### Employee Management

* Admin employee creation
* Duplicate email/code handling
* Role authorization

### Attendance

* Successful punch-in
* Duplicate punch-in
* Concurrent punch-in requests
* Successful punch-out
* Punch-out before punch-in
* Duplicate punch-out
* Attendance history retrieval

### Security

* Missing JWT
* Invalid JWT
* Employee accessing admin endpoints
* Employee attendance isolation

---

# Security

The application follows several security practices.

## Password Security

Passwords are hashed using bcrypt.

Plaintext passwords are never stored in the database.

## JWT Authentication

Protected endpoints require:

```http
Authorization: Bearer <JWT>
```

JWTs are verified before attendance operations or protected resources are processed.

## Authorization

JWT authentication and role-based authorization are separate concerns.

Authentication determines:

```text
Who is the user?
```

Authorization determines:

```text
What is the user allowed to do?
```

## Environment Secrets

Secrets are stored in environment variables.

`.env` is excluded from Git.

## HTTP Security

Helmet is used to add common HTTP security headers.

---

# Development Scripts

Recommended scripts:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit",
    "test": "jest"
  }
}
```

Run development server:

```bash
pnpm dev
```

Type check:

```bash
pnpm typecheck
```

Build:

```bash
pnpm build
```

Run production build:

```bash
pnpm start
```

Run tests:

```bash
pnpm test
```

---

# Prisma Commands

Generate Prisma Client:

```bash
pnpm exec prisma generate
```

Create migration:

```bash
pnpm exec prisma migrate dev --name <migration-name>
```

Apply migrations:

```bash
pnpm exec prisma migrate deploy
```

Open Prisma Studio:

```bash
pnpm exec prisma studio
```

---

# Production Build

Build the TypeScript project:

```bash
pnpm build
```

This generates:

```text
dist/
```

Start the compiled application:

```bash
pnpm start
```

Before production deployment:

* Set production `DATABASE_URL`
* Set a strong `JWT_SECRET`
* Set `NODE_ENV=production`
* Do not expose `.env`
* Run database migrations
* Do not use development seed credentials

---

# Known Limitations and Assumptions

## Attendance Date

Attendance is currently modeled as one attendance session per employee per calendar date.

The database uniqueness rule is:

```text
employee_id + date
```

## Time Zone

The implementation should use a clearly defined application/database time-zone strategy. Timestamps are stored consistently, while the attendance date is normalized according to the application's configured business timezone.

## One Session Per Day

The current design assumes one punch-in/punch-out session per employee per day.

Multiple shifts or multiple attendance sessions per day would require a different attendance model.

## Authentication

JWT authentication is stateless.

Token revocation/blacklisting is not implemented.

## Pagination

Basic employee and attendance retrieval is provided. Large-scale pagination can be added as a future improvement.

---

# Future Improvements

Possible production enhancements include:

* Refresh tokens
* Token revocation
* Rate limiting
* Structured logging
* Request correlation IDs
* API pagination
* Swagger/OpenAPI
* Redis caching
* Background report generation
* Monthly report exports
* Multiple shifts per day
* Attendance corrections
* Audit logs
* Soft deletion
* Dockerized API deployment
* CI/CD pipeline
* Monitoring and metrics

---

# Optional Features

Potential bonus features include:

* GraphQL attendance retrieval
* Redis caching
* Docker/Docker Compose
* Swagger/OpenAPI documentation
* Background worker for monthly attendance reports
* Rate limiting
* Structured logging

---

# API Summary

```text
AUTHENTICATION

POST   /api/auth/login


EMPLOYEE MANAGEMENT - ADMIN

POST   /api/employees
GET    /api/employees
GET    /api/employees/:id
PUT    /api/employees/:id
DELETE /api/employees/:id


ATTENDANCE - EMPLOYEE

POST   /api/attendance/punch-in
POST   /api/attendance/punch-out
GET    /api/attendance/my


ATTENDANCE REPORT - ADMIN

GET    /api/admin/attendance


HEALTH

GET    /health
```

---

# Submission Checklist

Before submitting the repository:

```text
[ ] TypeScript project configured
[ ] Express API implemented
[ ] PostgreSQL configured
[ ] Prisma schema committed
[ ] Prisma migrations committed
[ ] JWT authentication implemented
[ ] Password hashing implemented
[ ] ADMIN role implemented
[ ] EMPLOYEE role implemented
[ ] Employee CRUD implemented
[ ] Punch-in implemented
[ ] Punch-out implemented
[ ] Own attendance retrieval implemented
[ ] Admin attendance report implemented
[ ] Date filtering implemented
[ ] Employee filtering implemented
[ ] Database unique constraint implemented
[ ] Concurrent punch-in handled
[ ] Input validation implemented
[ ] Centralized error handling implemented
[ ] Automated tests implemented
[ ] .env.example included
[ ] .env excluded from Git
[ ] README completed
[ ] No credentials committed
[ ] Clean Git history
[ ] Application builds successfully
[ ] Tests pass
```

---

# License

This project was created as a technical assignment for evaluation purposes.
