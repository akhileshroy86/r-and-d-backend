# Healthcare Management System - API Endpoints

## Base URL
```
http://localhost:3002/api/v1
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 🔐 Authentication Endpoints

### POST /auth/login
Login user and get JWT token

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "role": "PATIENT"
  }
}
```

### POST /auth/staff/login
Staff login endpoint

**Request:**
```json
{
  "email": "staff@hospital.com",
  "password": "staffpassword"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "staff@hospital.com",
    "role": "STAFF"
  }
}
```

## 👥 User Management

### POST /users
Create a new user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "PATIENT"
}
```

**Response:**
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "role": "PATIENT",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### GET /users
Get all users (Admin/Staff only)

**Response:**
```json
[
  {
    "id": "user-id",
    "email": "user@example.com",
    "role": "PATIENT",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

## 🏥 Hospital Management

### POST /hospitals
Create hospital (Admin only)

**Request:**
```json
{
  "name": "City General Hospital",
  "address": "123 Medical Street, City",
  "phone": "+1-555-0123",
  "email": "info@citygeneral.com",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "status": "OPEN",
  "operatingHours": {
    "monday": { "open": "08:00", "close": "20:00" },
    "tuesday": { "open": "08:00", "close": "20:00" }
  }
}
```

**Response:**
```json
{
  "id": "hospital-id",
  "name": "City General Hospital",
  "address": "123 Medical Street, City",
  "phone": "+1-555-0123",
  "email": "info@citygeneral.com",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "rating": 0,
  "totalReviews": 0,
  "status": "OPEN",
  "operatingHours": {},
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### GET /hospitals
Get all hospitals

**Response:**
```json
[
  {
    "id": "hospital-id",
    "name": "City General Hospital",
    "rating": 4.5,
    "totalReviews": 150,
    "departments": [
      {
        "id": "dept-id",
        "name": "Cardiology"
      }
    ],
    "_count": {
      "doctors": 25,
      "reviews": 150
    }
  }
]
```

### GET /hospitals/nearby
Find nearby hospitals

**Query Parameters:**
- `lat`: Latitude (required)
- `lng`: Longitude (required)
- `radius`: Search radius in km (default: 10)

**Response:**
```json
[
  {
    "id": "hospital-id",
    "name": "City General Hospital",
    "address": "123 Medical Street",
    "distance": 2.5,
    "rating": 4.5,
    "departments": []
  }
]
```

### GET /hospitals/:id
Get hospital details

**Response:**
```json
{
  "id": "hospital-id",
  "name": "City General Hospital",
  "address": "123 Medical Street",
  "rating": 4.5,
  "totalReviews": 150,
  "departments": [
    {
      "id": "dept-id",
      "name": "Cardiology",
      "description": "Heart and cardiovascular care"
    }
  ],
  "doctors": [
    {
      "id": "doctor-id",
      "firstName": "John",
      "lastName": "Smith",
      "specialization": "Cardiology"
    }
  ],
  "reviews": [
    {
      "id": "review-id",
      "rating": 5,
      "comment": "Excellent service",
      "patient": {
        "firstName": "Jane",
        "lastName": "Doe"
      }
    }
  ]
}
```

## 🏢 Department Management

### POST /departments
Create department (Admin only)

**Request:**
```json
{
  "name": "Cardiology",
  "hospitalId": "hospital-id",
  "description": "Heart and cardiovascular care"
}
```

**Response:**
```json
{
  "id": "dept-id",
  "name": "Cardiology",
  "hospitalId": "hospital-id",
  "description": "Heart and cardiovascular care"
}
```

### GET /departments
Get all departments

**Response:**
```json
[
  {
    "id": "dept-id",
    "name": "Cardiology",
    "hospital": {
      "id": "hospital-id",
      "name": "City General Hospital"
    },
    "doctors": [],
    "symptoms": [],
    "_count": {
      "doctors": 5
    }
  }
]
```

### GET /departments/hospital/:hospitalId
Get departments by hospital

**Response:**
```json
[
  {
    "id": "dept-id",
    "name": "Cardiology",
    "doctors": [
      {
        "id": "doctor-id",
        "firstName": "John",
        "lastName": "Smith"
      }
    ]
  }
]
```

### GET /departments/suggest
Get department suggestions by symptoms

**Query Parameters:**
- `symptoms`: Comma-separated symptoms (e.g., "chest pain,shortness of breath")

**Response:**
```json
[
  {
    "id": "dept-id",
    "name": "Cardiology",
    "doctors": [],
    "symptoms": [
      {
        "id": "symptom-id",
        "name": "Chest Pain",
        "keywords": ["chest", "pain", "heart"]
      }
    ]
  }
]
```

## 👨‍⚕️ Doctor Management

### POST /doctors
Create doctor profile

**Request:**
```json
{
  "userId": "user-id",
  "hospitalId": "hospital-id",
  "departmentId": "dept-id",
  "firstName": "John",
  "lastName": "Smith",
  "qualification": "MD, MBBS",
  "specialization": "Cardiology",
  "licenseNumber": "MD123456",
  "phone": "+1234567890",
  "experience": 10,
  "consultationFee": 500.00
}
```

**Response:**
```json
{
  "id": "doctor-id",
  "firstName": "John",
  "lastName": "Smith",
  "specialization": "Cardiology",
  "consultationFee": 500.00,
  "rating": 0,
  "totalReviews": 0,
  "hospital": {
    "name": "City General Hospital"
  },
  "department": {
    "name": "Cardiology"
  }
}
```

### GET /doctors
Get all doctors with ratings and availability

**Response:**
```json
[
  {
    "id": "doctor-id",
    "firstName": "John",
    "lastName": "Smith",
    "specialization": "Cardiology",
    "consultationFee": 500.00,
    "rating": 4.8,
    "totalReviews": 45,
    "hospital": {
      "name": "City General Hospital",
      "address": "123 Medical Street"
    },
    "department": {
      "name": "Cardiology"
    },
    "schedule": {
      "availableDays": ["MON", "TUE", "WED"],
      "startTime": "09:00",
      "endTime": "17:00"
    }
  }
]
```

### GET /doctors/:id
Get doctor details with reviews and schedule

**Response:**
```json
{
  "id": "doctor-id",
  "firstName": "John",
  "lastName": "Smith",
  "qualification": "MD, MBBS",
  "specialization": "Cardiology",
  "experience": 10,
  "consultationFee": 500.00,
  "rating": 4.8,
  "totalReviews": 45,
  "hospital": {
    "name": "City General Hospital"
  },
  "schedule": {
    "availableDays": ["MON", "TUE", "WED"],
    "startTime": "09:00",
    "endTime": "17:00",
    "lunchBreakStart": "13:00",
    "lunchBreakEnd": "14:00"
  },
  "reviews": [
    {
      "id": "review-id",
      "rating": 5,
      "comment": "Excellent doctor",
      "patient": {
        "firstName": "Jane",
        "lastName": "Doe"
      }
    }
  ]
}
```

## 📅 Doctor Schedule Management

### POST /doctor-schedule
Create doctor schedule

**Request:**
```json
{
  "doctorId": "doctor-id",
  "availableDays": ["MON", "TUE", "WED", "THU", "FRI"],
  "startTime": "09:00",
  "endTime": "17:00",
  "lunchBreakStart": "13:00",
  "lunchBreakEnd": "14:00",
  "consultationDuration": 30,
  "maxPatientsPerDay": 20
}
```

**Response:**
```json
{
  "id": "schedule-id",
  "doctorId": "doctor-id",
  "availableDays": ["MON", "TUE", "WED", "THU", "FRI"],
  "startTime": "09:00",
  "endTime": "17:00",
  "lunchBreakStart": "13:00",
  "lunchBreakEnd": "14:00",
  "consultationDuration": 30,
  "maxPatientsPerDay": 20,
  "doctor": {
    "firstName": "John",
    "lastName": "Smith"
  }
}
```

### GET /doctor-schedule/slots/:doctorId
Get available time slots

**Query Parameters:**
- `date`: Date in YYYY-MM-DD format (required)

**Response:**
```json
[
  {
    "startTime": "09:00",
    "endTime": "09:30",
    "available": true
  },
  {
    "startTime": "09:30",
    "endTime": "10:00",
    "available": true
  }
]
```

### GET /doctor-schedule/availability/:doctorId
Check doctor availability

**Query Parameters:**
- `dateTime`: ISO datetime string (required)

**Response:**
```json
{
  "available": true
}
```

## 🏥 Patient Management

### POST /patients
Create patient profile

**Request:**
```json
{
  "userId": "user-id",
  "firstName": "Jane",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "phone": "+1987654321",
  "address": "456 Oak Street",
  "emergencyContact": "+1555123456",
  "bloodGroup": "O+",
  "allergies": "Penicillin"
}
```

**Response:**
```json
{
  "id": "patient-id",
  "firstName": "Jane",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "phone": "+1987654321",
  "address": "456 Oak Street",
  "emergencyContact": "+1555123456",
  "bloodGroup": "O+",
  "allergies": "Penicillin"
}
```

### GET /patients
Get all patients (Staff/Admin only)

**Response:**
```json
[
  {
    "id": "patient-id",
    "firstName": "Jane",
    "lastName": "Doe",
    "phone": "+1987654321",
    "bloodGroup": "O+"
  }
]
```

### GET /patients/:id
Get patient details and history

**Response:**
```json
{
  "id": "patient-id",
  "firstName": "Jane",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "phone": "+1987654321",
  "appointments": [
    {
      "id": "appointment-id",
      "dateTime": "2024-01-15T10:00:00Z",
      "status": "COMPLETED",
      "doctor": {
        "firstName": "John",
        "lastName": "Smith"
      }
    }
  ]
}
```

## 📋 Appointment Management

### POST /appointments
Create appointment with time range

**Request:**
```json
{
  "patientId": "patient-id",
  "doctorId": "doctor-id",
  "dateTime": "2024-01-15T10:00:00Z",
  "timeRange": "10:00-10:30",
  "duration": 30,
  "notes": "Regular checkup",
  "symptoms": "Chest pain, fatigue"
}
```

**Response:**
```json
{
  "id": "appointment-id",
  "patientId": "patient-id",
  "doctorId": "doctor-id",
  "dateTime": "2024-01-15T10:00:00Z",
  "timeRange": "10:00-10:30",
  "status": "SCHEDULED",
  "notes": "Regular checkup",
  "symptoms": "Chest pain, fatigue",
  "isWalkIn": false
}
```

### GET /appointments
Get appointments with advanced filters

**Query Parameters:**
- `status`: Filter by appointment status
- `doctorId`: Filter by doctor ID
- `patientId`: Filter by patient ID
- `date`: Filter by date (YYYY-MM-DD)
- `isWalkIn`: Filter walk-in appointments

**Response:**
```json
[
  {
    "id": "appointment-id",
    "dateTime": "2024-01-15T10:00:00Z",
    "timeRange": "10:00-10:30",
    "status": "SCHEDULED",
    "patient": {
      "firstName": "Jane",
      "lastName": "Doe",
      "phone": "+1987654321"
    },
    "doctor": {
      "firstName": "John",
      "lastName": "Smith",
      "specialization": "Cardiology"
    }
  }
]
```

### PATCH /appointments/:id/status
Update appointment status

**Request:**
```json
{
  "status": "COMPLETED",
  "notes": "Patient responded well to treatment"
}
```

**Response:**
```json
{
  "id": "appointment-id",
  "status": "COMPLETED",
  "notes": "Patient responded well to treatment",
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

## 📝 Booking Management

### POST /bookings
Create booking with payment integration

**Request:**
```json
{
  "appointmentId": "appointment-id",
  "timeRange": "10:00-10:30"
}
```

**Response:**
```json
{
  "id": "booking-id",
  "bookingId": "BK123456ABCD",
  "appointmentId": "appointment-id",
  "timeRange": "10:00-10:30",
  "status": "PENDING",
  "canRejoin": false,
  "appointment": {
    "patient": {
      "firstName": "Jane",
      "lastName": "Doe",
      "phone": "+1987654321"
    },
    "doctor": {
      "firstName": "John",
      "lastName": "Smith",
      "specialization": "Cardiology"
    }
  }
}
```

### GET /bookings/patient/:patientId
Get patient booking history

**Response:**
```json
[
  {
    "id": "booking-id",
    "bookingId": "BK123456ABCD",
    "timeRange": "10:00-10:30",
    "status": "CONFIRMED",
    "appointment": {
      "dateTime": "2024-01-15T10:00:00Z",
      "doctor": {
        "firstName": "John",
        "lastName": "Smith",
        "specialization": "Cardiology"
      }
    },
    "payment": {
      "amount": 500.00,
      "status": "COMPLETED"
    }
  }
]
```

### POST /bookings/walk-in
Create walk-in booking (Staff only)

**Request:**
```json
{
  "patientId": "patient-id",
  "doctorId": "doctor-id",
  "timeRange": "14:00-14:30"
}
```

**Response:**
```json
{
  "id": "booking-id",
  "bookingId": "BK789012EFGH",
  "timeRange": "14:00-14:30",
  "status": "CONFIRMED"
}
```

### PATCH /bookings/:bookingId/enable-rejoin
Enable patient rejoin (Doctor only)

**Response:**
```json
{
  "id": "booking-id",
  "bookingId": "BK123456ABCD",
  "canRejoin": true,
  "updatedAt": "2024-01-15T15:00:00Z"
}
```

## 💰 Payment Management

### POST /payments/razorpay/create
Create Razorpay payment order

**Request:**
```json
{
  "bookingId": "booking-id",
  "amount": 500.00,
  "currency": "INR"
}
```

**Response:**
```json
{
  "orderId": "order_razorpay_id",
  "amount": 50000,
  "currency": "INR",
  "paymentId": "payment-id"
}
```

### POST /payments/razorpay/verify
Verify payment signature

**Request:**
```json
{
  "razorpayOrderId": "order_razorpay_id",
  "razorpayPaymentId": "pay_razorpay_id",
  "razorpaySignature": "signature_hash"
}
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "payment-id",
    "status": "COMPLETED",
    "amount": 500.00,
    "paidAt": "2024-01-15T10:30:00Z"
  }
}
```

### GET /payments/booking/:bookingId
Get payment status

**Response:**
```json
{
  "id": "payment-id",
  "bookingId": "booking-id",
  "amount": 500.00,
  "status": "COMPLETED",
  "method": "ONLINE",
  "razorpayPaymentId": "pay_razorpay_id",
  "paidAt": "2024-01-15T10:30:00Z"
}
```

### GET /payments/analytics
Payment analytics and reports (Admin only)

**Response:**
```json
{
  "totalRevenue": 50000.00,
  "todayRevenue": 2500.00,
  "onlinePayments": 45,
  "offlinePayments": 15
}
```

## ⭐ Review & Rating Management

### POST /reviews
Submit review after appointment

**Request:**
```json
{
  "patientId": "patient-id",
  "doctorId": "doctor-id",
  "hospitalId": "hospital-id",
  "bookingId": "booking-id",
  "rating": 5,
  "comment": "Excellent service and care",
  "isAnonymous": false
}
```

**Response:**
```json
{
  "id": "review-id",
  "rating": 5,
  "comment": "Excellent service and care",
  "isAnonymous": false,
  "createdAt": "2024-01-15T12:00:00Z",
  "patient": {
    "firstName": "Jane",
    "lastName": "Doe"
  },
  "doctor": {
    "firstName": "John",
    "lastName": "Smith"
  }
}
```

### GET /reviews/doctor/:doctorId
Get doctor reviews

**Response:**
```json
[
  {
    "id": "review-id",
    "rating": 5,
    "comment": "Excellent doctor",
    "isAnonymous": false,
    "createdAt": "2024-01-15T12:00:00Z",
    "patient": {
      "firstName": "Jane",
      "lastName": "Doe"
    }
  }
]
```

### GET /reviews/hospital/:hospitalId
Get hospital reviews

**Response:**
```json
[
  {
    "id": "review-id",
    "rating": 4,
    "comment": "Good facilities",
    "patient": {
      "firstName": "Jane",
      "lastName": "Doe"
    },
    "doctor": {
      "firstName": "John",
      "lastName": "Smith"
    }
  }
]
```

## 🔄 Real-time Queue Management

### POST /realtime-queue/join
Join doctor's queue

**Request:**
```json
{
  "doctorId": "doctor-id",
  "patientId": "patient-id"
}
```

**Response:**
```json
{
  "id": "queue-entry-id",
  "position": 3,
  "status": "WAITING",
  "joinedAt": "2024-01-15T10:00:00Z",
  "patient": {
    "firstName": "Jane",
    "lastName": "Doe",
    "phone": "+1987654321"
  }
}
```

### GET /realtime-queue/status/:doctorId
Get real-time queue status

**Response:**
```json
{
  "id": "queue-id",
  "currentPosition": 2,
  "estimatedWaitTime": 45,
  "entries": [
    {
      "id": "entry-id",
      "position": 1,
      "status": "CALLED",
      "patient": {
        "firstName": "John",
        "lastName": "Patient"
      }
    },
    {
      "id": "entry-id-2",
      "position": 2,
      "status": "WAITING",
      "patient": {
        "firstName": "Jane",
        "lastName": "Doe"
      }
    }
  ]
}
```

### POST /realtime-queue/call-next/:doctorId
Call next patient (Doctor/Staff)

**Response:**
```json
{
  "id": "queue-entry-id",
  "position": 1,
  "status": "CALLED",
  "calledAt": "2024-01-15T10:30:00Z",
  "patient": {
    "firstName": "Jane",
    "lastName": "Doe",
    "phone": "+1987654321"
  }
}
```

### WebSocket Events
Connect to `/queue/updates` for real-time updates:

**Events Received:**
- `queueUpdated`: Queue status changed
- `patientCalled`: Patient was called for consultation

## 🔍 Search & Discovery

### GET /search
Advanced search with filters

**Query Parameters:**
- `query`: Search term
- `type`: Search type (all, hospitals, doctors, symptoms)
- `department`: Filter by department
- `minFee`: Minimum consultation fee
- `maxFee`: Maximum consultation fee
- `minRating`: Minimum rating
- `latitude`: User latitude
- `longitude`: User longitude
- `radius`: Search radius in km
- `sortBy`: Sort by (relevance, rating, fee, popularity)

**Response:**
```json
{
  "hospitals": [
    {
      "id": "hospital-id",
      "name": "City General Hospital",
      "rating": 4.5,
      "departments": []
    }
  ],
  "doctors": [
    {
      "id": "doctor-id",
      "firstName": "John",
      "lastName": "Smith",
      "specialization": "Cardiology",
      "consultationFee": 500.00,
      "rating": 4.8
    }
  ],
  "symptoms": [
    {
      "id": "symptom-id",
      "name": "Chest Pain",
      "department": {
        "name": "Cardiology"
      }
    }
  ]
}
```

### GET /search/suggestions
Get search suggestions

**Query Parameters:**
- `q`: Query string (minimum 2 characters)

**Response:**
```json
{
  "hospitals": ["City General Hospital", "Metro Medical Center"],
  "doctors": ["Dr. John Smith - Cardiology", "Dr. Jane Wilson - Pediatrics"],
  "departments": ["Cardiology", "Pediatrics", "Orthopedics"]
}
```

### GET /search/popular
Get popular search terms

**Response:**
```json
[
  "Cardiology",
  "Orthopedics",
  "Pediatrics",
  "Dermatology",
  "Neurology"
]
```

## 📊 Analytics & Reports

### GET /analytics/dashboard
Comprehensive dashboard with revenue snapshot

**Response:**
```json
{
  "totalPatients": 1250,
  "totalDoctors": 45,
  "totalStaff": 25,
  "totalHospitals": 3,
  "totalAppointments": 5680,
  "todayAppointments": 35,
  "pendingAppointments": 12,
  "todayRevenue": 15000.00,
  "totalRevenue": 2500000.00,
  "onlinePayments": 4500,
  "offlinePayments": 1180
}
```

### GET /analytics/doctor-revenue
Doctor-wise revenue analytics (Admin only)

**Response:**
```json
[
  {
    "id": "doctor-id",
    "name": "Dr. John Smith",
    "specialization": "Cardiology",
    "revenue": 125000.00
  }
]
```

### GET /analytics/payments
Payment analytics (daily/weekly/monthly)

**Response:**
```json
{
  "daily": [
    {
      "date": "2024-01-15",
      "revenue": 2500.00
    }
  ],
  "weekly": [
    {
      "week": "Week 1",
      "revenue": 15000.00
    }
  ],
  "monthly": [
    {
      "month": "January 2024",
      "revenue": 50000.00
    }
  ]
}
```

### GET /analytics/reviews
Review analytics and rating distribution

**Response:**
```json
{
  "averageRating": 4.3,
  "totalReviews": 1250,
  "ratingDistribution": [
    {
      "rating": 5,
      "count": 650
    },
    {
      "rating": 4,
      "count": 400
    }
  ]
}
```

### GET /analytics/hospitals
Hospital performance analytics (Admin only)

**Response:**
```json
[
  {
    "id": "hospital-id",
    "name": "City General Hospital",
    "rating": 4.5,
    "totalReviews": 350,
    "doctorCount": 25,
    "departmentCount": 8
  }
]
```

## 👨‍💼 Staff Operations

### POST /staff
Create staff profile (Admin only)

**Request:**
```json
{
  "userId": "user-id",
  "firstName": "Alice",
  "lastName": "Johnson",
  "position": "Nurse",
  "phone": "+1122334455"
}
```

**Response:**
```json
{
  "id": "staff-id",
  "firstName": "Alice",
  "lastName": "Johnson",
  "position": "Nurse",
  "phone": "+1122334455"
}
```

### GET /staff
Get all staff with performance metrics

**Response:**
```json
[
  {
    "id": "staff-id",
    "firstName": "Alice",
    "lastName": "Johnson",
    "position": "Nurse",
    "phone": "+1122334455"
  }
]
```

### POST /staff/:id/change-password
Change staff password

**Request:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

### GET /staff/profile/:userId
Get staff profile by user ID

**Response:**
```json
{
  "id": "staff-id",
  "userId": "user-id",
  "fullName": "Alice Johnson",
  "email": "alice@hospital.com",
  "phone": "+1122334455",
  "position": "Nurse",
  "isActive": true,
  "user": {
    "id": "user-id",
    "email": "alice@hospital.com",
    "role": "STAFF"
  }
}
```

## 🔔 Notifications & Settings

### POST /notifications/send
Send notifications (Email/SMS/Push)

**Request:**
```json
{
  "type": "EMAIL",
  "recipient": "patient@example.com",
  "subject": "Appointment Reminder",
  "message": "Your appointment is tomorrow at 10:00 AM"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "notification-id"
}
```

### GET /settings
Get system settings

**Response:**
```json
{
  "clinicName": "Healthcare Clinic",
  "clinicAddress": "123 Medical Street",
  "clinicPhone": "+1-555-0123",
  "businessHours": {
    "monday": { "open": "08:00", "close": "18:00" }
  }
}
```

### PUT /settings
Update system configuration (Admin only)

**Request:**
```json
{
  "clinicName": "Updated Healthcare Clinic",
  "clinicAddress": "456 New Medical Street",
  "businessHours": {
    "monday": { "open": "09:00", "close": "17:00" }
  }
}
```

**Response:**
```json
{
  "id": "settings-id",
  "clinicName": "Updated Healthcare Clinic",
  "clinicAddress": "456 New Medical Street",
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

## 🏥 System Health & Monitoring

### GET /health
Application health check

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00Z",
  "uptime": 86400,
  "database": "connected",
  "memory": {
    "used": "150MB",
    "total": "512MB"
  }
}
```

### GET /audit-log
System activity logs (Admin only)

**Query Parameters:**
- `userId`: Filter by user ID
- `action`: Filter by action type
- `resource`: Filter by resource type
- `limit`: Number of records (default: 50)
- `offset`: Pagination offset

**Response:**
```json
[
  {
    "id": "log-id",
    "userId": "user-id",
    "action": "CREATE",
    "resource": "APPOINTMENT",
    "resourceId": "appointment-id",
    "timestamp": "2024-01-15T10:00:00Z",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  }
]
```

### POST /file-upload
Upload profile pictures and documents

**Request:** (multipart/form-data)
- `file`: File to upload
- `type`: File type (profile, document)

**Response:**
```json
{
  "id": "file-id",
  "filename": "profile.jpg",
  "url": "/uploads/profile.jpg",
  "size": 1024000,
  "mimeType": "image/jpeg"
}
```

## 📋 Status Values & Enums

### User Roles
- `ADMIN`: Full system access
- `DOCTOR`: Access to appointments, patients, analytics
- `PATIENT`: Limited access to own data
- `STAFF`: Administrative functions

### Appointment Status
- `SCHEDULED`: Initial status
- `CONFIRMED`: Appointment confirmed
- `IN_PROGRESS`: Currently happening
- `COMPLETED`: Finished
- `CANCELLED`: Cancelled
- `NO_SHOW`: Patient didn't show up

### Booking Status
- `PENDING`: Awaiting confirmation
- `CONFIRMED`: Booking confirmed
- `CANCELLED`: Booking cancelled

### Payment Status
- `PENDING`: Payment not completed
- `COMPLETED`: Payment successful
- `FAILED`: Payment failed
- `REFUNDED`: Payment refunded

### Payment Method
- `ONLINE`: Online payment via Razorpay
- `OFFLINE`: Cash payment
- `UPI`: UPI payment

### Hospital Status
- `OPEN`: Hospital is open
- `CLOSED`: Hospital is closed
- `MAINTENANCE`: Under maintenance

### Queue Status
- `WAITING`: Patient waiting in queue
- `CALLED`: Patient called for consultation
- `IN_CONSULTATION`: Patient with doctor
- `COMPLETED`: Consultation completed
- `CANCELLED`: Queue entry cancelled

## 🔒 Authentication & Authorization

### Protected Routes
Most endpoints require authentication. Include JWT token in header:
```
Authorization: Bearer <your-jwt-token>
```

### Role-based Access
- **Admin**: Full access to all endpoints
- **Doctor**: Access to own appointments, patients, analytics
- **Patient**: Access to own data and booking
- **Staff**: Administrative functions, appointment management

### Error Responses
All endpoints may return these error responses:

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": ["Validation error messages"],
  "error": "Bad Request"
}
```

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```