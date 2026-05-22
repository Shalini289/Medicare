# Project Structure

This document explains how the MediCare project is organized and where to find each major part of the system.

## Root

```text
.
|-- backend/          Express API, database models, controllers, realtime server
|-- frontend/         Next.js app, pages, UI components, services, styles
|-- assets/           Project images and architecture visuals
|-- docs/             Project documentation
|-- README.md         Main project overview
|-- ENV_SETUP.md      Environment setup notes
|-- package.json      Root frontend helper scripts
`-- vercel.json       Deployment routing config
```

## Backend Structure

```text
backend/
|-- config/           Database and third-party client configuration
|-- controllers/      API request handlers and business logic
|-- data/             Seed/demo data
|-- jobs/             Cron/background jobs
|-- middleware/       Auth, role checks, uploads, errors, logging, rate limits
|-- models/           Mongoose schemas
|-- routes/           Express route definitions
|-- scripts/          Seed scripts
|-- services/         Shared backend services
|-- uploads/          Uploaded report files
|-- utils/            Reusable utilities
`-- server.js         Express and Socket.io entry point
```

## Frontend Structure

```text
frontend/src/
|-- app/              Next.js App Router pages
|-- components/       Reusable UI components
|-- services/         API service wrappers
|-- styles/           Feature-specific CSS files
|-- utils/            Auth, API, and runtime helpers
`-- hooks/            Shared React hooks, if needed
```

## Feature Ownership

| Feature | Frontend | Backend |
| --- | --- | --- |
| Authentication | `app/login`, `app/signup`, `app/(protected)/security` | `routes/auth.js`, `controllers/authController.js`, `models/User.js` |
| Dashboard | `app/(protected)/dashboard` | `routes/dashboard.js`, `controllers/dashboardController.js` |
| Doctors | `app/doctors`, `app/doctors/[id]` | `routes/doctors.js`, `controllers/doctorController.js`, `models/Doctor.js` |
| Doctor Portal | `app/(protected)/doctor` | `routes/doctorPortal.js`, `controllers/doctorPortalController.js` |
| Appointments | `app/(protected)/booking` | `routes/appointments.js`, `controllers/appointmentController.js`, `models/Appointment.js` |
| Pharmacy | `app/(protected)/pharmacy`, `app/(protected)/orders` | `routes/pharmacy.js`, `controllers/pharmacyController.js`, `models/Medicine.js`, `models/Order.js` |
| Reports | `app/(protected)/reports` | `routes/report.js`, `controllers/reportController.js`, `models/Report.js`, `utils/aiAnalyzer.js` |
| AI Symptom Checker | `app/symptoms` | `routes/ai.js`, `controllers/aiController.js` |
| Hospital Beds | `app/hospital`, `app/(protected)/hospital-portal` | `routes/hospital.js`, `controllers/hospitalController.js`, `models/Hospital.js` |
| Lab Tests | `app/(protected)/lab-tests`, `app/(protected)/pathology` | `routes/labTests.js`, `controllers/labTestController.js`, `models/LabTest.js`, `models/LabBooking.js` |
| Admin | `app/(protected)/admin` | `routes/admin.js`, `controllers/adminController.js` |
| Health Records | `app/(protected)/medical-id`, `vitals`, `vaccinations`, `care-plans`, `reminders` | related health controllers and models |
| Realtime Chat | `app/(protected)/chat` | `routes/chat.js`, `controllers/chatController.js`, Socket.io in `server.js` |
| Advanced Care | `app/(protected)/advanced-care` | Uses existing modules and documents roadmap features |

## Naming Rules

- Backend routes live in `backend/routes`.
- Backend controllers live in `backend/controllers`.
- MongoDB schemas live in `backend/models`.
- Frontend pages live in `frontend/src/app`.
- Frontend API wrappers live in `frontend/src/services`.
- Feature CSS lives in `frontend/src/styles`.
- Shared global styles live in `frontend/src/app/globals.css`.

## Role-Based Areas

| Role | Main UI | Backend Access |
| --- | --- | --- |
| Patient/User | `/dashboard`, `/health`, `/reports`, `/booking` | Protected user routes |
| Admin | `/admin` | `protect, admin` |
| Doctor | `/doctor` | `protect, doctorOnly` |
| Pharmacy | `/pharmacy` | `protect, pharmacyStaff` |
| Pathology | `/pathology` | `protect, pathologyOnly` |
| Hospital | `/hospital-portal` | `protect, hospitalOnly` |
