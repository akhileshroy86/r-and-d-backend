# Healthcare Management System Backend

A NestJS backend application for healthcare management with PostgreSQL and Prisma.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Support for different user roles (Admin, Doctor, Patient, Staff)
- **Doctor Management**: Doctor profiles with specializations and license information
- **Patient Management**: Patient records with personal information and medical history
- **Appointment System**: Complete appointment scheduling and management
- **Staff Management**: Staff member profiles and role management
- **Analytics**: Dashboard statistics and reporting

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT with Passport
- **Validation**: Class Validator
- **Password Hashing**: bcrypt

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```
Update the `.env` file with your database credentials and JWT secret.

3. Generate Prisma client:
```bash
npm run prisma:generate
```

4. Run database migrations:
```bash
npm run prisma:migrate
```

5. Start the development server:
```bash
npm run start:dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /auth/login` - User login

### Users
- `POST /users` - Create user
- `GET /users` - Get all users (protected)

### Doctors
- `POST /doctors` - Create doctor profile
- `GET /doctors` - Get all doctors
- `GET /doctors/:id` - Get doctor by ID

### Patients
- `POST /patients` - Create patient profile
- `GET /patients` - Get all patients
- `GET /patients/:id` - Get patient by ID

### Appointments
- `POST /appointments` - Create appointment
- `GET /appointments` - Get all appointments (with optional filters)
- `GET /appointments/:id` - Get appointment by ID
- `PATCH /appointments/:id/status` - Update appointment status

### Staff
- `POST /staff` - Create staff profile
- `GET /staff` - Get all staff
- `GET /staff/:id` - Get staff by ID

### Analytics
- `GET /analytics/dashboard` - Get dashboard statistics
- `GET /analytics/appointments-by-status` - Get appointments grouped by status
- `GET /analytics/monthly-appointments` - Get monthly appointment trends

## Database Schema

The application uses the following main entities:

- **User**: Base user entity with authentication
- **Doctor**: Doctor profiles linked to users
- **Patient**: Patient profiles linked to users
- **Staff**: Staff profiles linked to users
- **Appointment**: Appointment scheduling between doctors and patients

## Development

### Running Tests
```bash
npm run test
```

### Database Management
```bash
# View database in Prisma Studio
npm run prisma:studio

# Reset database
npx prisma migrate reset

# Deploy migrations to production
npx prisma migrate deploy
```

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format
```

## Environment Variables

```env
DATABASE_URL="postgresql://username:password@localhost:5432/healthcare_db?schema=public"
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRES_IN="7d"
```

## Project Structure

```
src/
├── config/           # Configuration files (Prisma, etc.)
├── common/           # Shared utilities, guards, decorators
├── modules/          # Feature modules
│   ├── auth/         # Authentication module
│   ├── users/        # User management
│   ├── doctors/      # Doctor management
│   ├── patients/     # Patient management
│   ├── appointments/ # Appointment system
│   ├── staff/        # Staff management
│   └── analytics/    # Analytics and reporting
├── app.module.ts     # Root application module
└── main.ts           # Application entry point
```