# Assignment 02 - Internal Tech Issue & Feature Tracker

A Node.js, Express, TypeScript, and PostgreSQL API for reporting internal software issues, filtering issue lists, and managing issue updates with role-based permissions.

## Features

- User signup and login
- Password hashing with bcrypt
- JWT access token authentication
- Refresh token cookie during login
- Public issue listing and single issue lookup
- Authenticated issue creation
- Contributor and maintainer roles
- Contributor update rules for own open issues
- Maintainer delete permission
- Sorting and filtering for issue lists

## Tech Stack

- Node.js
- Express
- TypeScript
- PostgreSQL
- bcrypt
- jsonwebtoken
- dotenv

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
PORT=5000
CONNECTION_STRING=your_postgres_connection_string
JWT_SECRET=your_access_token_secret
REFRESH_SECRET=your_refresh_token_secret
```

Run the development server:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

The server creates the required `users` and `issues` tables on startup.

## Base URL

```http
http://localhost:5000
```

## Authentication

Protected routes require an access token in the `Authorization` header:

```http
Authorization: Bearer <accessToken>
```

The access token payload contains:

```json
{
  "id": 1,
  "name": "John Doe",
  "role": "contributor"
}
```

## Roles

`contributor`
- Can create issues
- Can update only their own issues
- Can update only issues that are still `open`

`maintainer`
- Can update any issue
- Can delete issues

## Auth Endpoints

### Signup

```http
POST /api/auth/signup
```

Body:

```json
{
  "name": "John Doe",
  "email": "john.doe@devpulse.com",
  "password": "secret123",
  "role": "contributor"
}
```

Success response:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@devpulse.com",
    "role": "contributor",
    "created_at": "2026-01-20T09:00:00.000Z",
    "updated_at": "2026-01-20T09:00:00.000Z"
  }
}
```

### Login

```http
POST /api/auth/login
```

Body:

```json
{
  "email": "john.doe@devpulse.com",
  "password": "secret123"
}
```

Success response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<accessToken>",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@devpulse.com",
      "role": "contributor",
      "created_at": "2026-01-20T09:00:00.000Z",
      "updated_at": "2026-01-20T09:00:00.000Z"
    }
  }
}
```

## Issue Endpoints

### Create Issue

Access: Authenticated

```http
POST /api/issues
```

Body:

```json
{
  "title": "Database connection timeout under load",
  "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
  "type": "bug",
  "status": "open"
}
```

Allowed `type` values:

```txt
bug, feature_request
```

Allowed `status` values:

```txt
open, in_progress, resolved
```

Success response:

```json
{
  "success": true,
  "message": "Issue created successfully",
  "data": {
    "id": 45,
    "title": "Database connection timeout under load",
    "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
    "type": "bug",
    "status": "open",
    "reporter_id": 1,
    "created_at": "2026-01-20T10:30:00.000Z",
    "updated_at": "2026-01-20T10:30:00.000Z"
  }
}
```

### Get All Issues

Access: Public

```http
GET /api/issues
```

Optional query parameters:

| Param | Values | Default |
| --- | --- | --- |
| `sort` | `newest`, `oldest` | `newest` |
| `type` | `bug`, `feature_request` | none |
| `status` | `open`, `in_progress`, `resolved` | none |

Example:

```http
GET /api/issues?sort=newest&type=bug&status=open
```

Success response:

```json
{
  "success": true,
  "data": [
    {
      "id": 45,
      "title": "Database connection timeout under load",
      "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
      "type": "bug",
      "status": "open",
      "reporter": {
        "id": 1,
        "name": "John Doe",
        "role": "contributor"
      },
      "created_at": "2026-01-20T10:30:00.000Z",
      "updated_at": "2026-01-20T14:45:00.000Z"
    }
  ]
}
```

### Get Single Issue

Access: Public

```http
GET /api/issues/:id
```

Success response:

```json
{
  "success": true,
  "data": {
    "id": 45,
    "title": "Database connection timeout under load",
    "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
    "type": "bug",
    "status": "open",
    "reporter": {
      "id": 1,
      "name": "John Doe",
      "role": "contributor"
    },
    "created_at": "2026-01-20T10:30:00.000Z",
    "updated_at": "2026-01-20T14:45:00.000Z"
  }
}
```

### Update Issue

Access: Authenticated

```http
PATCH /api/issues/:id
```

Body:

```json
{
  "status": "in_progress"
}
```

Success response:

```json
{
  "success": true,
  "message": "Issue updated successfully",
  "data": {
    "id": 45,
    "title": "Database connection timeout under load",
    "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
    "type": "bug",
    "status": "in_progress",
    "reporter": {
      "id": 1,
      "name": "John Doe",
      "role": "contributor"
    },
    "created_at": "2026-01-20T10:30:00.000Z",
    "updated_at": "2026-01-20T14:45:00.000Z"
  }
}
```

### Delete Issue

Access: Maintainer only

```http
DELETE /api/issues/:id
```

Success response:

```json
{
  "success": true,
  "message": "Issue deleted successfully"
}
```

## Error Response

Errors are handled by the global error handler:

```json
{
  "success": false,
  "message": "Forbidden",
  "error": "Only maintainers can delete issues"
}
```

Common status codes:

| Status | Meaning |
| --- | --- |
| `400` | Invalid request or invalid query value |
| `401` | Missing or invalid token |
| `403` | Authenticated user does not have permission |
| `404` | Resource not found |
| `409` | Contributor tried to update an issue that is no longer open |
| `500` | Internal server error |
