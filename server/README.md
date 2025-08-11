# GlobeTrotter Authentication Server

A TypeScript-based authentication server using Express.js, Sequelize ORM, and PostgreSQL.

## Features

- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Input validation with Joi
- PostgreSQL database with Sequelize ORM
- TypeScript for type safety
- Error handling middleware

## Setup

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update the `.env` file with your database credentials:
```env
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/globetrotter
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
```

4. Run database migration:
```bash
npm run db:migrate
```

5. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires authentication)

### Health Check

- `GET /health` - Server health check

## User Schema

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "username": "johnd",
  "email": "john@example.com",
  "phone_number": "+911234567890",
  "city": "Delhi",
  "country": "India",
  "password": "mypassword",
  "avatar_url": "https://example.com/avatar.jpg",
  "additional_info": "Love to travel!"
}
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run db:migrate` - Run database migration

## Project Structure

```
src/
├── config/
│   └── database.ts          # Sequelize configuration
├── controllers/
│   └── authController.ts    # Authentication controller
├── middleware/
│   ├── auth.ts             # JWT authentication middleware
│   ├── validation.ts       # Input validation middleware
│   └── errorHandler.ts     # Error handling middleware
├── models/
│   ├── User.ts             # User model
│   └── index.ts            # Database initialization
├── routes/
│   └── auth.ts             # Authentication routes
├── types/
│   └── user.ts             # TypeScript interfaces
├── migrations/
│   └── create-users-table.ts # Database migration
└── index.ts                # Main server file
```
