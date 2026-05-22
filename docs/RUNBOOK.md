# Development Runbook

Use this file when setting up, running, debugging, or presenting the project.

## Prerequisites

- Node.js 20.x
- npm
- MongoDB local or MongoDB Atlas

## Install

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd frontend
npm install
```

## Environment Files

Backend:

```text
backend/.env
```

Frontend:

```text
frontend/.env.local
```

Minimum backend variables:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/medicare
JWT_SECRET=replace_with_a_long_random_secret
RECORD_ENCRYPTION_KEY=replace_with_a_long_random_encryption_key
FRONTEND_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000
```

Minimum frontend variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Run Locally

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:3000
```

## Seed Data

```bash
cd backend
npm run seed:doctors
npm run seed:medicines
```

## Verify Before Delivery

Frontend lint:

```bash
cd frontend
npm run lint
```

Frontend build:

```bash
cd frontend
npm run build
```

Backend syntax check:

```powershell
rg --files backend -g '*.js' -g '!node_modules' | ForEach-Object { node --check $_ }
```

## Common Issues

### API Error on Frontend

Check:

- Backend is running.
- `NEXT_PUBLIC_API_URL` points to backend.
- JWT token exists for protected route.
- User role matches the page.

### Forgot Password Email Not Sending

Use one of:

- Brevo SMTP
- Gmail App Password
- SendGrid verified sender
- Resend verified sender

For Brevo:

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_brevo_smtp_login
SMTP_PASS=your_brevo_smtp_key
EMAIL_FROM=MediCare <your_verified_sender_email>
```

Restart backend after editing `.env`.

### Doctor Profile Not Found

Doctor profiles are now auto-created for doctor users when `/api/doctors/me/profile` or doctor portal APIs are called.

### Admin Records Analysis Too Long

Admin records now show report analysis as a compact preview. Full report analysis is available on `/reports`.

## Presentation Flow

1. Explain the problem: fragmented healthcare workflows.
2. Explain roles: patient, doctor, admin, pharmacy, pathology, hospital.
3. Show patient dashboard and location search.
4. Show appointment booking.
5. Show medical report upload and AI doctor-style analysis.
6. Show doctor portal.
7. Show pathology and hospital portals.
8. Show admin analytics and records.
9. Mention realtime layer: chat, notifications, bed updates.
10. Mention Advanced Care roadmap for product thinking.
