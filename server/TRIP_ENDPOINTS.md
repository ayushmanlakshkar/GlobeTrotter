# Trip Management Endpoints

This document outlines all the trip-related endpoints that have been implemented.

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Trip CRUD Operations

#### 1. Create Trip
- **POST** `/api/trips`
- **Body:**
```json
{
  "name": "Trip to Europe",
  "description": "A wonderful journey through Europe",
  "start_date": "2024-06-01",
  "end_date": "2024-06-15",
  "cover_photo": "https://example.com/photo.jpg",
  "is_public": true
}
```
- **Response:** Created trip object

#### 2. Get Trip by ID
- **GET** `/api/trips/:tripId`
- **Response:** Trip details with full information

### Trip Discovery

#### 3. Get Regional Selections
- **GET** `/api/trips/regional-selections?limit=10&page=1`
- **Response:** Popular trips from user's region

#### 4. Get Previous Trips
- **GET** `/api/trips/previous?limit=10&page=1`
- **Response:** User's completed trips

#### 5. Get Upcoming Trips
- **GET** `/api/trips/upcoming?limit=10&page=1`
- **Response:** User's future trips

### Trip Stop Management

#### 6. Add Trip Stop
- **POST** `/api/trips/:tripId/stops`
- **Body:**
```json
{
  "city_id": "uuid-of-city",
  "start_date": "2024-06-02",
  "end_date": "2024-06-05",
  "order_index": 1
}
```
- **Response:** Created trip stop object

#### 7. Remove Trip Stop
- **DELETE** `/api/trips/:tripId/stops/:stopId`
- **Response:** Success message
- **Note:** Also removes all associated activities

### Trip Activity Management

#### 8. Add Trip Activity
- **POST** `/api/trips/:tripId/stops/:stopId/activities`
- **Body:**
```json
{
  "activity_id": "uuid-of-activity",
  "date": "2024-06-03",
  "time": "14:30",
  "min_cost_override": 50,
  "max_cost_override": 100
}
```
- **Response:** Created trip activity object

#### 9. Remove Trip Activity
- **DELETE** `/api/trips/:tripId/stops/:stopId/activities/:activityId`
- **Response:** Success message

### Suggestion Endpoints (Placeholders)

#### 10. Get Suggested Places
- **GET** `/api/trips/:tripId/suggested-places`
- **Response:** Empty array (as requested)
```json
{
  "success": true,
  "data": {
    "suggestions": []
  }
}
```

#### 11. Get Suggested Activities
- **GET** `/api/trips/:tripId/suggested-activities`
- **Response:** Empty array (as requested)
```json
{
  "success": true,
  "data": {
    "suggestions": []
  }
}
```

## Validation Rules

### Create Trip
- `name`: Required, 1-255 characters
- `description`: Optional, max 1000 characters
- `start_date`: Required, ISO date format
- `end_date`: Required, ISO date format, must be after start_date
- `cover_photo`: Optional, valid URL
- `is_public`: Optional, boolean

### Add Trip Stop
- `city_id`: Required, valid UUID
- `start_date`: Required, ISO date format
- `end_date`: Required, ISO date format, must be after start_date
- `order_index`: Optional, non-negative integer

### Add Trip Activity
- `activity_id`: Required, valid UUID
- `date`: Required, ISO date format
- `time`: Optional, HH:MM format
- `min_cost_override`: Optional, non-negative number
- `max_cost_override`: Optional, non-negative number

## Error Responses

All endpoints return consistent error responses:
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

Common HTTP status codes:
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `404`: Not Found (resource doesn't exist or access denied)
- `500`: Internal Server Error

## cURL Examples

### 1. Create Trip
```bash
curl -X POST http://localhost:3000/api/trips \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Trip to Europe",
    "description": "A wonderful journey through Europe",
    "start_date": "2024-06-01",
    "end_date": "2024-06-15",
    "cover_photo": "https://example.com/photo.jpg",
    "is_public": true
  }'
```

### 2. Get Trip by ID
```bash
curl -X GET http://localhost:3000/api/trips/TRIP_UUID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Get Regional Selections
```bash
curl -X GET "http://localhost:3000/api/trips/regional-selections?limit=10&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Get Previous Trips
```bash
curl -X GET "http://localhost:3000/api/trips/previous?limit=10&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Get Upcoming Trips
```bash
curl -X GET "http://localhost:3000/api/trips/upcoming?limit=10&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Add Trip Stop
```bash
curl -X POST http://localhost:3000/api/trips/TRIP_UUID/stops \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "city_id": "CITY_UUID",
    "start_date": "2024-06-02",
    "end_date": "2024-06-05",
    "order_index": 1
  }'
```

### 7. Remove Trip Stop
```bash
curl -X DELETE http://localhost:3000/api/trips/TRIP_UUID/stops/STOP_UUID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 8. Add Trip Activity
```bash
curl -X POST http://localhost:3000/api/trips/TRIP_UUID/stops/STOP_UUID/activities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "activity_id": "ACTIVITY_UUID",
    "date": "2024-06-03",
    "time": "14:30",
    "min_cost_override": 50,
    "max_cost_override": 100
  }'
```

### 9. Remove Trip Activity
```bash
curl -X DELETE http://localhost:3000/api/trips/TRIP_UUID/stops/STOP_UUID/activities/ACTIVITY_UUID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 10. Get Suggested Places
```bash
curl -X GET http://localhost:3000/api/trips/TRIP_UUID/suggested-places \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 11. Get Suggested Activities
```bash
curl -X GET http://localhost:3000/api/trips/TRIP_UUID/suggested-activities \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Authentication Setup

To get a JWT token for testing, first register or login:

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "phone_number": "+1234567890",
    "city": "New York",
    "country": "USA",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

The response will contain a `token` field. Use this token in the `Authorization: Bearer TOKEN` header for all trip endpoints.

## Notes

1. Replace `YOUR_JWT_TOKEN` with the actual JWT token from login/register
2. Replace `TRIP_UUID`, `STOP_UUID`, `CITY_UUID`, and `ACTIVITY_UUID` with actual UUIDs
3. All trip operations require the user to be the owner of the trip
4. Trip stops must have dates within the trip's date range
5. Trip activities must have dates within the trip stop's date range
6. Removing a trip stop also removes all its associated activities
7. Order index for trip stops is automatically assigned if not provided
8. Suggested places and activities endpoints currently return empty arrays as placeholders
9. Change `localhost:3000` to your actual server URL if different
