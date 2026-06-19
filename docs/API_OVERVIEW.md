# API Overview

Base backend URL in local development:

```text
http://localhost:5000
```

Frontend should use:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## API Groups

| Area | Base Route | Purpose |
| --- | --- | --- |
| Auth | `/api/auth` | Signup, login, profile, password, 2FA, reset password |
| Dashboard | `/api/dashboard` | Patient dashboard data |
| Doctors | `/api/doctors` | Doctor listing and doctor profile |
| Doctor Portal | `/api/doctor-portal` | Doctor dashboard, notes, prescriptions, diagnosis support |
| Appointments | `/api/appointments` | Booking, slots, appointment history, cancellation, live queue |
| Pharmacy | `/api/pharmacy` | Medicines, orders, inventory, alerts |
| Blood Donors | `/api/blood-donors` | Donor search and donor profile |
| Payment | `/api/payment` | Razorpay order and verification |
| AI | `/api/ai` | Symptom checker |
| Health EMI | `/api/health-emi` | EMI eligibility scoring and repayment options |
| Reviews | `/api/review` | Doctor reviews |
| Family | `/api/family` | Family member management |
| Chat | `/api/chat` | Chat threads and messages |
| Hospital | `/api/hospital` | Public hospitals and hospital portal |
| Admin | `/api/admin` | Admin analytics and CRUD modules |
| Notifications | `/api/notifications` | Notification list and status |
| Medicine Reminders | `/api/medicine-reminders` | Reminder CRUD and taken status |
| Prescriptions | `/api/prescriptions` | Patient prescription list and prescription analysis |
| Vitals | `/api/vitals` | Vitals tracking |
| Medical Profile | `/api/medical-profile` | Medical ID and emergency contacts |
| Lab Tests | `/api/lab-tests` | Lab catalog, bookings, pathology portal |
| Care Plans | `/api/care-plans` | Care plan and task tracking |
| Vaccinations | `/api/vaccinations` | Vaccination tracking |

## Auth Pattern

Protected requests send:

```text
Authorization: Bearer <jwt>
```

Frontend wrapper:

```text
frontend/src/utils/api.js
```

## Important Protected Areas

| Route | Middleware |
| --- | --- |
| `/api/admin/*` | `protect, admin` |
| `/api/doctor-portal/*` | `protect, doctorOnly` |
| `/api/lab-tests/pathology/*` | `protect, pathologyOnly` |
| `/api/hospital/portal` | `protect, hospitalOnly` |
| Pharmacy staff routes | `protect, pharmacyStaff` |

## Uploads

Allowed prescription analysis upload types:

```text
PDF, PNG, JPG, JPEG
```

Prescription analysis upload:

```text
POST /api/prescriptions/analyze
Content-Type: multipart/form-data
field: file
```

Health EMI prediction:

```text
POST /api/health-emi/predict
```

Voice assistant health guidance uses:

```text
POST /api/ai/symptoms
```

Offline clinic sync uses the doctor note API:

```text
POST /api/doctor-portal/notes
```

## Realtime Events

Socket.io runs on the backend server.

Common event areas:

- Chat messages
- Notifications
- `bedUpdate`
- `ambulanceUpdate`
- `appointmentQueueUpdated`

## Error Format

Most backend errors return:

```json
{
  "msg": "Error message"
}
```

The frontend API wrapper converts failed responses into readable exceptions with status and endpoint.
