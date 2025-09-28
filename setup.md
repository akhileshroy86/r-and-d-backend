# Healthcare Management System - Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Quick Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```
Update the `.env` file with your database credentials and JWT secret.

3. **Generate Prisma client:**
```bash
npm run prisma:generate
```

4. **Run database migrations:**
```bash
npm run prisma:migrate
```

5. **Seed the database with sample data:**
```bash
npm run prisma:seed
```

6. **Start the development server:**
```bash
npm run start:dev
```

## Default Users (After Seeding)

### Admin User
- Email: `admin@healthcare.com`
- Password: `admin123`
- Role: ADMIN

### Doctor User
- Email: `dr.smith@healthcare.com`
- Password: `doctor123`
- Role: DOCTOR

### Patient User
- Email: `patient@example.com`
- Password: `patient123`
- Role: PATIENT

### Staff User
- Email: `staff@healthcare.com`
- Password: `staff123`
- Role: STAFF

## API Testing

The server will start on `http://localhost:3000`

### Test the health endpoint:
```bash
curl http://localhost:3000/api/v1/health
```

### Login as admin:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@healthcare.com","password":"admin123"}'
```

### Get dashboard stats (use token from login):
```bash
curl http://localhost:3000/api/v1/analytics/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Database Management

### View database in Prisma Studio:
```bash
npm run prisma:studio
```

### Reset database:
```bash
npm run prisma:reset
```

### Deploy migrations to production:
```bash
npx prisma migrate deploy
```

## Development Commands

### Lint code:
```bash
npm run lint
```

### Format code:
```bash
npm run format
```

### Run tests:
```bash
npm run test
```

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Update database URL for production
3. Use a strong JWT secret
4. Configure SMTP settings for email notifications
5. Run migrations: `npx prisma migrate deploy`
6. Start the application: `npm run start:prod`