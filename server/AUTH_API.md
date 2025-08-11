# Authentication API Documentation

## Overview
The GlobeTrotter authentication system provides user registration, login, and profile management functionality using JWT (JSON Web Tokens) for secure authentication.

## Base URL
```
http://localhost:3000/api/auth
```

## Endpoints

### 1. User Registration
**Endpoint:** `POST /register`

**Description:** Creates a new user account with email and username uniqueness validation.

**Request Body:**
```json
{
  "first_name": "string (required)",
  "last_name": "string (required)", 
  "username": "string (required, unique)",
  "email": "string (required, unique)",
  "phone_number": "string (required)",
  "city": "string (required)",
  "country": "string (required)",
  "password": "string (required)",
  "avatar_url": "string (optional)",
  "additional_info": "string (optional)"
}
```

**Success Response (201 Created):**
```json
{
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "username": "johndoe",
    "email": "john.doe@example.com",
    "phone_number": "+1234567890",
    "city": "New York",
    "country": "USA",
    "avatar_url": "https://example.com/avatar.jpg",
    "additional_info": "Travel enthusiast",
    "created_at": "2025-08-11T10:30:00.000Z",
    "updated_at": "2025-08-11T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400 Bad Request`: Email already registered / Username already taken
- `500 Internal Server Error`: Server error

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "username": "johndoe",
    "email": "john.doe@example.com",
    "phone_number": "+1234567890",
    "city": "New York",
    "country": "USA",
    "password": "securepassword123",
    "avatar_url": "https://example.com/avatar.jpg",
    "additional_info": "Travel enthusiast"
  }'
```

---

### 2. User Login
**Endpoint:** `POST /login`

**Description:** Authenticates a user with email and password, returns JWT token.

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "username": "johndoe",
    "email": "john.doe@example.com",
    "phone_number": "+1234567890",
    "city": "New York",
    "country": "USA",
    "avatar_url": "https://example.com/avatar.jpg",
    "additional_info": "Travel enthusiast",
    "created_at": "2025-08-11T10:30:00.000Z",
    "updated_at": "2025-08-11T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials
- `500 Internal Server Error`: Server error

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securepassword123"
  }'
```

---

### 3. Get User Profile
**Endpoint:** `GET /profile`

**Description:** Retrieves the authenticated user's profile information.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe",
  "email": "john.doe@example.com",
  "phone_number": "+1234567890",
  "city": "New York",
  "country": "USA",
  "avatar_url": "https://example.com/avatar.jpg",
  "additional_info": "Travel enthusiast",
  "created_at": "2025-08-11T10:30:00.000Z",
  "updated_at": "2025-08-11T10:30:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## Authentication Flow

1. **Registration/Login**: User provides credentials and receives a JWT token
2. **Token Storage**: Client stores the JWT token (typically in localStorage or cookies)
3. **Protected Requests**: Client includes token in Authorization header for protected routes
4. **Token Validation**: Server validates JWT token on each protected request

## Security Features

- **Password Hashing**: Passwords are hashed using bcryptjs with configurable salt rounds (default: 12)
- **JWT Tokens**: Stateless authentication with configurable expiration (default: 7 days)
- **Input Validation**: Email and username uniqueness validation
- **Error Handling**: Consistent error responses without exposing sensitive information

## Environment Variables

```env
DATABASE_URL=postgresql://username:password@localhost:5432/globetrotter
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation errors) |
| 401 | Unauthorized (invalid credentials/token) |
| 404 | Not Found |
| 500 | Internal Server Error |

## Testing

To test the authentication system:

1. Start the server: `npm run dev`
2. Use the provided cURL commands or a tool like Postman
3. Register a new user first
4. Login with the registered credentials
5. Use the returned token for protected routes

## Notes

- All responses exclude the `password_hash` field for security
- JWT tokens contain `userId` and `email` in the payload
- Usernames and emails must be unique across the system
- Optional fields: `avatar_url`, `additional_info`
