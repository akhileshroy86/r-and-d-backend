# Healthcare Management System - Backend Module List

## Tech Stack
- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT with Passport
- **Validation**: Class Validator
- **Password Hashing**: bcrypt
- **Payment**: Razorpay SDK
- **Real-time**: Socket.io
- **AI/ML**: OpenAI API / Custom ML models
- **Internationalization**: i18n
- **File Processing**: Multer, Sharp
- **PDF Generation**: PDFKit
- **Excel Export**: ExcelJS

## 🚨 CRITICAL MISSING MODULES (HIGH PRIORITY)

### 1. Hospitals Module (`hospitals`) - **NEW**
- **Purpose**: Hospital/Clinic management and multi-location support
- **Features**:
  - Hospital registration and profiles
  - Location-based hospital discovery
  - Hospital ratings and reviews
  - Operating hours and status
  - Department management per hospital
  - Hospital-specific settings
- **Dependencies**: Users module, Reviews module

### 2. Departments Module (`departments`) - **NEW**
- **Purpose**: Medical department management
- **Features**:
  - Department creation and management
  - Department-doctor mapping
  - Symptom-to-department AI mapping
  - Department-specific queues
- **Dependencies**: Hospitals module, Doctors module

### 3. Payments Module (`payments`) - **NEW**
- **Purpose**: Payment processing and financial management
- **Features**:
  - Razorpay integration
  - UPI payment flow
  - Payment status tracking
  - Booking ID generation with payment linkage
  - Online/offline payment records
  - Payment analytics and reports
  - Revenue tracking (daily, doctor-wise, department-wise)
  - Payment export (PDF/Excel/CSV)
- **Dependencies**: Appointments module, Bookings module

### 4. Bookings Module (`bookings`) - **NEW**
- **Purpose**: Enhanced booking system with time ranges
- **Features**:
  - Time range booking (12-1 PM vs fixed slots)
  - Booking ID generation
  - Payment integration
  - Booking status management
  - Walk-in booking support
  - Revisit booking after labs
- **Dependencies**: Doctors module, Patients module, Payments module

### 5. Reviews Module (`reviews`) - **NEW**
- **Purpose**: Doctor and hospital rating system
- **Features**:
  - Review submission after appointments
  - Rating system (1-5 stars)
  - Review moderation
  - Review analytics
  - Patient privacy options (masked names)
- **Dependencies**: Patients module, Doctors module, Hospitals module

### 6. Real-time Queue Module (`realtime-queue`) - **ENHANCED**
- **Purpose**: Real-time queue management with Socket.io
- **Features**:
  - Real-time queue updates
  - Dynamic wait time calculation
  - Queue position tracking
  - Doctor delay/early notifications
  - Live queue status for all users
- **Dependencies**: Appointments module, Socket.io

### 7. AI Symptoms Module (`ai-symptoms`) - **NEW**
- **Purpose**: AI-powered symptom analysis and department suggestion
- **Features**:
  - Voice recording transcription
  - Symptom text analysis
  - Department recommendation AI
  - Symptom-doctor mapping
  - Medical history analysis
- **Dependencies**: Departments module, Doctors module

### 8. Internationalization Module (`i18n`) - **NEW**
- **Purpose**: Multi-language support
- **Features**:
  - Language switching (Telugu, Hindi, English, Marathi, Gujarati)
  - Translation management
  - Locale-specific formatting
  - User language preferences
- **Dependencies**: Users module

### 9. Search Module (`search`) - **NEW**
- **Purpose**: Advanced search and filtering system
- **Features**:
  - Hospital search with filters
  - Doctor search with specialization
  - Symptom-based search
  - Location-based filtering
  - Fee range filtering
  - Rating-based sorting
- **Dependencies**: Hospitals module, Doctors module, Reviews module

### 10. Doctor Schedule Module (`doctor-schedule`) - **NEW**
- **Purpose**: Doctor availability and schedule management
- **Features**:
  - Available days configuration (Mon-Sun)
  - Start/end time management
  - Lunch break scheduling
  - Consultation duration per patient
  - Maximum patients per day
  - Holiday management
- **Dependencies**: Doctors module

## 📊 ENHANCED EXISTING MODULES

### 11. Enhanced Analytics Module (`analytics`) - **UPGRADE**
- **Purpose**: Comprehensive analytics and reporting
- **Features**:
  - Dashboard with revenue snapshot
  - Doctor-wise analytics (appointments, revenue, consultation time)
  - Staff-wise analytics (appointments handled, payments collected)
  - Payment analytics (online vs offline)
  - Review analytics (ratings, feedback)
  - Financial reports with export
  - Real-time drawer totals
- **Dependencies**: All modules

### 12. Enhanced Notifications Module (`notifications`) - **UPGRADE**
- **Purpose**: Multi-channel notification system
- **Features**:
  - Email notifications
  - SMS notifications
  - Push notifications
  - Real-time in-app notifications
  - Appointment confirmations and reminders
  - Queue status updates
- **Dependencies**: Users module, Appointments module

### 13. Enhanced Staff Module (`staff`) - **UPGRADE**
- **Purpose**: Staff dashboard and operations
- **Features**:
  - Accept/reject appointments
  - Walk-in patient registration
  - Real-time drawer management
  - End-of-day reports
  - Patient search by mobile
  - Queue management operations
- **Dependencies**: Users module, Payments module

## 🔧 UTILITY MODULES

### 14. File Processing Module (`file-processing`) - **ENHANCED**
- **Purpose**: Advanced file handling
- **Features**:
  - Profile picture uploads
  - Medical document uploads
  - Audio file processing (voice recordings)
  - Image compression and optimization
  - File security and validation
- **Dependencies**: Users module

### 15. Reports Module (`reports`) - **NEW**
- **Purpose**: PDF and Excel report generation
- **Features**:
  - Patient details PDF export
  - Payment reports (daily/weekly/monthly)
  - Appointment reports
  - Revenue reports
  - Custom report builder
- **Dependencies**: Analytics module, Payments module

### 16. Location Module (`location`) - **NEW**
- **Purpose**: Location-based services
- **Features**:
  - Auto-location detection
  - Nearby hospital discovery
  - Distance calculation
  - Location-based search
- **Dependencies**: Hospitals module

## EXISTING MODULES (ALREADY IMPLEMENTED)

### 17. Authentication Module (`auth`) ✅
### 18. Users Module (`users`) ✅
### 19. Doctors Module (`doctors`) ✅ - Needs enhancement
### 20. Patients Module (`patients`) ✅ - Needs enhancement
### 21. Appointments Module (`appointments`) ✅ - Needs enhancement
### 22. Settings Module (`settings`) ✅
### 23. Audit Log Module (`audit-log`) ✅
### 24. Health Check Module (`health`) ✅

## 🗄️ DATABASE SCHEMA UPDATES REQUIRED

### Enhanced Prisma Schema (`prisma`) - **CRITICAL UPDATE**
- **New Models Needed**:
  - Hospital (id, name, address, phone, rating, status, departments[])
  - Department (id, name, hospitalId, symptoms[], doctors[])
  - Payment (id, bookingId, amount, status, razorpayId, method)
  - Booking (id, paymentId, patientId, doctorId, timeRange, status)
  - Review (id, patientId, doctorId, hospitalId, rating, comment, bookingId)
  - Queue (id, doctorId, patients[], currentPosition, estimatedWaitTime)
  - DoctorSchedule (id, doctorId, availableDays[], startTime, endTime, lunchBreak)
  - Symptom (id, name, departmentId, keywords[])
  - UserPreferences (id, userId, language, notifications)

## 🔧 INFRASTRUCTURE MODULES

### 25. Common Module (`common`) ✅
### 26. Config Module (`config`) ✅ - Needs Razorpay config
### 27. Prisma Module (`prisma`) ✅ - Needs schema updates

## 🏗️ MODULE DEPENDENCIES STRUCTURE

```
App Module
├── Config Module (Enhanced with Razorpay)
├── Common Module
├── Health Module
├── Prisma Module (Updated schema)
├── I18n Module (NEW)
├── Location Module (NEW)
├── Auth Module
│   └── Users Module
├── Users Module (Enhanced)
├── Hospitals Module (NEW)
│   ├── Location Module
│   └── Reviews Module
├── Departments Module (NEW)
│   └── Hospitals Module
├── Doctors Module (Enhanced)
│   ├── Users Module
│   ├── Departments Module
│   └── Doctor Schedule Module
├── Doctor Schedule Module (NEW)
│   └── Doctors Module
├── Patients Module (Enhanced)
│   └── Users Module
├── Staff Module (Enhanced)
│   ├── Users Module
│   └── Payments Module
├── Bookings Module (NEW)
│   ├── Doctors Module
│   ├── Patients Module
│   └── Payments Module
├── Payments Module (NEW - CRITICAL)
│   └── Bookings Module
├── Appointments Module (Enhanced)
│   ├── Bookings Module
│   ├── Doctors Module
│   ├── Patients Module
│   └── Notifications Module
├── Real-time Queue Module (NEW - CRITICAL)
│   ├── Appointments Module
│   ├── Patients Module
│   └── Socket.io
├── AI Symptoms Module (NEW)
│   ├── Departments Module
│   └── Doctors Module
├── Search Module (NEW)
│   ├── Hospitals Module
│   ├── Doctors Module
│   └── Reviews Module
├── Reviews Module (NEW - CRITICAL)
│   ├── Patients Module
│   ├── Doctors Module
│   └── Hospitals Module
├── Analytics Module (Enhanced)
│   ├── All modules
│   └── Reports Module
├── Reports Module (NEW)
│   ├── Analytics Module
│   └── Payments Module
├── Notifications Module (Enhanced)
│   ├── Users Module
│   └── Appointments Module
├── File Processing Module (Enhanced)
│   └── Users Module
├── Audit Log Module
├── Settings Module
│   └── Users Module
```

## 🚀 IMPLEMENTATION PRIORITY (CRITICAL GAPS FIRST)

### Phase 1 - CRITICAL MISSING FEATURES (Immediate)
1. **Payments Module** - Core business requirement
2. **Hospitals Module** - Multi-location support
3. **Departments Module** - Medical specialization
4. **Bookings Module** - Enhanced booking system
5. **Reviews Module** - User engagement
6. **Prisma Schema Update** - Database foundation

### Phase 2 - REAL-TIME & AI FEATURES (High Priority)
7. **Real-time Queue Module** - Patient experience
8. **AI Symptoms Module** - Smart recommendations
9. **I18n Module** - Multi-language support
10. **Search Module** - Discovery system
11. **Doctor Schedule Module** - Availability management

### Phase 3 - ENHANCED DASHBOARDS (Medium Priority)
12. **Enhanced Analytics Module** - Business intelligence
13. **Reports Module** - Data export
14. **Enhanced Staff Module** - Operations
15. **Enhanced Notifications Module** - Communication
16. **Location Module** - Geographic services

### Phase 4 - OPTIMIZATION (Low Priority)
17. **File Processing Module** - Media handling
18. **Enhanced existing modules** - Performance
19. **Advanced features** - Nice-to-have

## 📦 REQUIRED DEPENDENCIES TO ADD

```json
{
  "dependencies": {
    "razorpay": "^2.9.2",
    "socket.io": "^4.7.2",
    "@nestjs/websockets": "^10.0.0",
    "@nestjs/platform-socket.io": "^10.0.0",
    "nestjs-i18n": "^10.3.0",
    "openai": "^4.0.0",
    "pdfkit": "^0.13.0",
    "exceljs": "^4.3.0",
    "sharp": "^0.32.0",
    "node-cron": "^3.0.2",
    "@google-cloud/speech": "^6.0.0",
    "geolib": "^3.3.4"
  }
}
```

## 🔗 CRITICAL API ENDPOINTS TO IMPLEMENT

### Payment Endpoints (NEW)
- `POST /payments/razorpay/create` - Create payment order
- `POST /payments/razorpay/verify` - Verify payment
- `GET /payments/booking/:bookingId` - Get payment status
- `GET /payments/analytics` - Payment analytics

### Real-time Queue Endpoints (NEW)
- `GET /queue/realtime/:doctorId` - Real-time queue status
- `POST /queue/:queueId/join` - Join queue
- `WebSocket /queue/updates` - Live queue updates

### AI Symptoms Endpoints (NEW)
- `POST /ai/symptoms/analyze` - Analyze symptoms
- `POST /ai/voice/transcribe` - Voice to text
- `GET /ai/departments/suggest` - Get department suggestions

### Search Endpoints (NEW)
- `GET /search/hospitals` - Search hospitals with filters
- `GET /search/doctors` - Search doctors with filters
- `GET /search/symptoms` - Search symptoms

### Reviews Endpoints (NEW)
- `POST /reviews` - Submit review
- `GET /reviews/doctor/:doctorId` - Get doctor reviews
- `GET /reviews/hospital/:hospitalId` - Get hospital reviews

## 🔒 ENHANCED SECURITY REQUIREMENTS

- **Payment Security**: PCI DSS compliance for Razorpay
- **Real-time Security**: WebSocket authentication
- **AI Security**: Rate limiting for AI endpoints
- **File Security**: Virus scanning for uploads
- **Data Privacy**: HIPAA compliance for medical data

## 🧪 TESTING STRATEGY FOR NEW MODULES

### Critical Testing Areas
- **Payment Integration**: Razorpay webhook testing
- **Real-time Features**: WebSocket connection testing
- **AI Integration**: ML model accuracy testing
- **Multi-language**: i18n translation testing
- **Performance**: Load testing for queue system

## 📈 SUCCESS METRICS

### Implementation Success Criteria
- ✅ Payment success rate > 99%
- ✅ Real-time queue updates < 2 seconds
- ✅ AI symptom accuracy > 85%
- ✅ Multi-language support for 5 languages
- ✅ Search response time < 500ms
- ✅ Review system engagement > 70%

## 🎯 IMMEDIATE ACTION ITEMS

### Week 1-2: Database & Payment Foundation
1. Update Prisma schema with new models
2. Implement Payments module with Razorpay
3. Create Hospitals and Departments modules
4. Set up Bookings module

### Week 3-4: Real-time & Core Features
5. Implement Real-time Queue with Socket.io
6. Create Reviews module
7. Add AI Symptoms module (basic version)
8. Implement Search module

### Week 5-6: Enhanced Features
9. Add I18n support
10. Enhance Analytics with payment data
11. Create Reports module
12. Implement Doctor Schedule module

### Week 7-8: Integration & Testing
13. Integration testing
14. Performance optimization
15. Security audit
16. Documentation update

**TOTAL ESTIMATED EFFORT: 8 weeks for critical gaps**
**CURRENT IMPLEMENTATION: ~15% → TARGET: ~85%**