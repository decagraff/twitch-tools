# 🔌 API Reference

Complete REST API documentation for the Twitch Tools backend.

---

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 🔐 Authentication

#### Register

```http
POST /api/auth/register
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

---

#### Login

```http
POST /api/auth/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "user": { "id": "uuid", "email": "...", "name": "..." },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

---

#### Refresh Token

```http
POST /api/auth/refresh
```

**Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "new_jwt_token"
}
```

---

### 👤 Users

#### Get Current User

```http
GET /api/users/me
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2025-11-07T...",
  "updatedAt": "2025-11-07T..."
}
```

---

#### Update User

```http
PUT /api/users/me
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "New Name",
  "email": "newemail@example.com"
}
```

**Response:** `200 OK`

---

### ⚙️ Twitch Configurations

#### List Configurations

```http
GET /api/configs
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "clientId": "abc123",
    "name": "My App",
    "createdAt": "2025-11-07T..."
  }
]
```

**Note:** Client secrets are never returned

---

#### Create Configuration

```http
POST /api/configs
Authorization: Bearer <token>
```

**Body:**
```json
{
  "clientId": "your_twitch_client_id",
  "clientSecret": "your_twitch_client_secret",
  "name": "My Twitch App"
}
```

**Response:** `201 Created`

---

#### Delete Configuration

```http
DELETE /api/configs/:id
Authorization: Bearer <token>
```

**Response:** `204 No Content`

---

### 🎫 Tokens

#### List Saved Tokens

```http
GET /api/tokens
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "tokenType": "user",
    "scopes": ["user:read:email"],
    "channelId": "123456",
    "expiresAt": "2025-12-07T...",
    "createdAt": "2025-11-07T..."
  }
]
```

**Note:** Access tokens are never returned in list

---

#### Generate User Access Token

```http
POST /api/tokens/user
Authorization: Bearer <token>
```

**Body:**
```json
{
  "configId": "uuid",
  "scopes": ["user:read:email", "channel:read:subscriptions"]
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "decrypted_token_here",
  "scopes": ["user:read:email"],
  "channelId": "123456",
  "expiresAt": "2025-12-07T..."
}
```

---

#### Generate App Access Token

```http
POST /api/tokens/app
Authorization: Bearer <token>
```

**Body:**
```json
{
  "configId": "uuid"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "app_access_token_here",
  "expiresAt": "2025-12-07T..."
}
```

---

### 🪝 Webhooks

#### List Webhooks

```http
GET /api/webhooks
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "subscriptionId": "twitch_sub_id",
    "type": "channel.update",
    "callbackUrl": "https://...",
    "status": "enabled",
    "cost": 0,
    "createdAt": "2025-11-07T..."
  }
]
```

---

#### Create Webhook

```http
POST /api/webhooks
Authorization: Bearer <token>
```

**Body:**
```json
{
  "type": "channel.update",
  "condition": {
    "broadcaster_user_id": "123456"
  },
  "callbackUrl": "https://your-domain.com/webhooks"
}
```

**Response:** `201 Created`

---

#### Delete Webhook

```http
DELETE /api/webhooks/:id
Authorization: Bearer <token>
```

**Response:** `204 No Content`

---

## Error Responses

### 400 Bad Request

```json
{
  "error": "Validation Error",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 404 Not Found

```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

---

## Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 per window
- **Response:** `429 Too Many Requests`

---

**[⬆ Back to Main README](../README.md)** | **[Next: Frontend Guide →](05-FRONTEND-GUIDE.md)**
