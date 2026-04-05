# 01 — Authentication Endpoints

**Last Updated:** 2026-03-05  
**Status:** Active  
**Section:** arc42 Chapter 10 — API Reference

---

## POST /api/auth/register

Create a new user account.

**Auth required:** No

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass1!",
  "fullName": "Nguyen Van A",
  "phoneNumber": "+84901234567"
}
```

| Field | Type | Required | Validation |
|---|---|---|---|
| `email` | string | Yes | Valid email format, unique |
| `password` | string | Yes | Min 8 chars |
| `fullName` | string | Yes | Non-empty |
| `phoneNumber` | string | No | E.164 format recommended |

**Response 201:**

```json
{
  "status": "success",
  "data": {
    "token": "<jwt>",
    "user": {
      "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
      "email": "user@example.com",
      "fullName": "Nguyen Van A",
      "role": "USER"
    }
  }
}
```

**Error responses:** `409 EMAIL_ALREADY_EXISTS`, `400 VALIDATION_ERROR`

---

## POST /api/auth/login

Authenticate an existing user and receive a JWT.

**Auth required:** No

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass1!"
}
```

**Response 200:**

```json
{
  "status": "success",
  "data": {
    "token": "<jwt>",
    "user": {
      "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
      "email": "user@example.com",
      "fullName": "Nguyen Van A",
      "role": "USER"
    }
  }
}
```

**Error responses:** `401 INVALID_CREDENTIALS`, `400 VALIDATION_ERROR`

---

## GET /api/auth/me

Return the authenticated user's profile.

**Auth required:** Yes (Bearer token)

**Response 200:**

```json
{
  "status": "success",
  "data": {
    "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "phoneNumber": "+84901234567",
    "role": "USER",
    "status": "ACTIVE",
    "createdAt": "2026-03-01T10:00:00.000Z"
  }
}
```

**Error responses:** `401 MISSING_TOKEN`, `401 INVALID_TOKEN`

---

## POST /api/auth/forgot-password

Request a password reset OTP. An OTP code will be sent to the user's email.

**Auth required:** No

**Request body:**

```json
{
  "email": "user@example.com"
}
```

| Field | Type | Required | Validation |
|---|---|---|---|
| `email` | string | Yes | Valid email format, must exist in system |

**Response 200:**

```json
{
  "message": "If an account is found, an OTP has been sent to the email address associated with this account."
}
```

**Error responses:** `400 EMAIL_REQUIRED`, `500 EMAIL_SEND_FAILED`

---

## POST /api/auth/reset-password

Verify the OTP and set a new password for the user's account.

**Auth required:** No

**Request body:**

```json
{
  "email": "user@example.com",
  "otp": "123456",
  "new_password": "NewSecurePass1!",
  "confirm_password": "NewSecurePass1!"
}
```

| Field | Type | Required | Validation |
|---|---|---|---|
| `email` | string | Yes | Valid email format |
| `otp` | string | Yes | 6-digit OTP received via email |
| `new_password` | string | Yes | Min 6 chars |
| `confirm_password` | string | Yes | Must match `new_password` |

**Response 200:**

```json
{
  "message": "Password reset successfully."
}
```

**Error responses:** `400 PASSWORDS_DO_NOT_MATCH`, `400 INVALID_OR_EXPIRED_OTP`, `404 ACCOUNT_NOT_FOUND`
