# Environment Setup

Use these files as templates:

- Backend: copy `backend/.env.example` to `backend/.env`
- Frontend: copy `frontend/.env.example` to `frontend/.env.local`

Do not commit real `.env` files. They contain database URLs, JWT secrets, email credentials, and payment keys.

## Local Development

Backend:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/medicare
JWT_SECRET=replace_with_a_long_random_secret
RECORD_ENCRYPTION_KEY=replace_with_a_long_random_encryption_key
FRONTEND_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000
```

Frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Deployment

For Vercel frontend deployments, set this environment variable in the Vercel project:

```env
NEXT_PUBLIC_API_URL=https://your-deployed-backend-domain.com
```

Do not use `localhost` in deployed frontend environment variables. A deployed browser cannot reach your local machine's backend.

For the deployed backend, set at least:

```env
MONGO_URI=your_production_mongodb_connection_string
JWT_SECRET=your_long_random_jwt_secret
RECORD_ENCRYPTION_KEY=your_long_random_record_encryption_key
FRONTEND_URL=https://your-vercel-frontend-domain.com
CLIENT_URL=https://your-vercel-frontend-domain.com
```

Email credentials are needed for password reset and two-factor authentication. Razorpay, Groq, and Twilio keys are optional unless those features are used in production.

For deployed serverless backends, prefer an HTTPS email provider such as Resend or SendGrid instead of Gmail SMTP:

```env
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=MediCare <noreply@your_verified_domain.com>
```

or:

```env
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM=noreply@your_verified_domain.com
```

Also make sure `FRONTEND_URL` points to the deployed frontend, otherwise reset links may be generated for `localhost`.
