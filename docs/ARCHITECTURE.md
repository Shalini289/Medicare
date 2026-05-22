# Architecture

MediCare is a full-stack healthcare platform with a Next.js frontend, Express backend, MongoDB database, realtime Socket.io layer, and AI-assisted healthcare workflows.

## High-Level Flow

```text
User Browser
  |
  v
Next.js Frontend
  |
  v
API Service Layer
  |
  v
Express Backend
  |
  |-- Controllers
  |-- Middleware
  |-- Services
  |-- Socket.io Events
  |
  v
MongoDB
```

## Request Flow

```text
Page or Component
  -> frontend/src/services/*
  -> frontend/src/utils/api.js
  -> backend route
  -> auth/role middleware
  -> controller
  -> model/service
  -> MongoDB or third-party API
  -> JSON response
```

## Authentication Flow

```text
Signup/Login
  -> /api/auth/register or /api/auth/login
  -> backend validates credentials
  -> JWT generated
  -> frontend stores token
  -> protected pages decode token role
  -> backend verifies token on protected APIs
```

## Role-Based Access

Role checks happen in two places:

- Frontend pages redirect users away from portals they should not access.
- Backend middleware blocks unauthorized API access.

Backend role middleware:

```text
admin
doctorOnly
pharmacyStaff
pathologyOnly
hospitalOnly
```

## Realtime Architecture

Socket.io is used for realtime workflows:

```text
Client Socket
  <-> Socket.io Server
  <-> Events such as chat messages, notifications, bed updates
```

Current realtime use cases:

- Chat
- Hospital bed updates
- Notifications
- Ambulance/hospital operational updates

## AI Architecture

MediCare uses AI in two main places:

### Symptom Checker

```text
User symptoms
  -> /api/ai/symptoms
  -> health-topic guard
  -> Groq AI if configured
  -> fallback decision rules if AI unavailable
  -> care guidance response
```

### Medical Report Analysis

```text
Report upload
  -> file saved
  -> PDF/image text extraction
  -> AI report analysis
  -> doctor-style summary
  -> report saved in MongoDB
  -> frontend organizes analysis into patient-friendly sections
```

Important safety rule:

AI output is informational. It must not claim final diagnosis or prescribe medicine.

## Database Areas

Major MongoDB collections include:

- Users
- Doctors
- Appointments
- Hospitals
- Medicines
- Orders
- Reports
- LabTests
- LabBookings
- Staff
- Invoices
- InsuranceClaims
- Ambulances
- Departments
- MedicalProfiles
- Vitals
- Vaccinations
- CarePlans
- MedicineLogs
- Notifications
- Chats
- DoctorNotes
- Prescriptions

## Deployment Shape

```text
Frontend Hosting
  -> Next.js app

Backend Hosting
  -> Express API
  -> Socket.io
  -> File uploads

MongoDB Atlas or hosted MongoDB
  -> Persistent application data

Optional Integrations
  -> Groq
  -> Razorpay
  -> Brevo/Gmail/SendGrid/Resend
  -> Twilio
```
