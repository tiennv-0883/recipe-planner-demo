# Contract: Authentication API

**Module**: Auth | **Base path**: `/api/auth` | **Date**: 2026-03-14

All endpoints return JSON. Session cookies are managed automatically by
`@supabase/ssr`; clients do not need to handle tokens manually.

---

## POST /api/auth/signup

Register a new user account.

### Request

```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",    // required, valid email
  "password": "secret1234"        // required, min 8 characters
}
```

### Responses

| Status | Body | Condition |
|--------|------|-----------|
| 201 | `{ "user": { "id": "uuid", "email": "..." } }` | Account created successfully |
| 400 | `{ "error": "Invalid email or password too short" }` | Validation failure |
| 409 | `{ "error": "Email already in use" }` | Duplicate email |
| 500 | `{ "error": "Internal server error" }` | Unexpected Supabase error |

On success, the session cookie is set and the client is authenticated.

---

## POST /api/auth/login

Log in with existing credentials.

### Request

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secret1234"
}
```

### Responses

| Status | Body | Condition |
|--------|------|-----------|
| 200 | `{ "user": { "id": "uuid", "email": "...", "seeded": true } }` | Login successful |
| 400 | `{ "error": "Email and password required" }` | Missing fields |
| 401 | `{ "error": "Invalid credentials" }` | Wrong email/password |
| 500 | `{ "error": "Internal server error" }` | Unexpected error |

`seeded: false` indicates the client should call `POST /api/recipes/seed` to copy
seed recipes to the new account.

---

## POST /api/auth/logout

Log out the currently authenticated user.

### Request

```http
POST /api/auth/logout
(no body required)
```

### Responses

| Status | Body | Condition |
|--------|------|-----------|
| 200 | `{ "ok": true }` | Session cleared |
| 500 | `{ "error": "Internal server error" }` | Unexpected error |

The session cookie is cleared on success.

---

## GET /api/auth/me

Return the currently authenticated user.

### Request

```http
GET /api/auth/me
(Cookie: supabase session)
```

### Responses

| Status | Body | Condition |
|--------|------|-----------|
| 200 | `{ "user": { "id": "uuid", "email": "...", "seeded": true } }` | Authenticated |
| 401 | `{ "error": "Unauthorized" }` | No valid session |

