# Portfolio Backend (Render Ready)

Production-ready Node.js + Express + MongoDB Atlas backend for portfolio inquiries.

## Features

- Express API with health route and root route
- MongoDB Atlas connection via Mongoose + environment variables
- `POST /api/inquiries` for contact/inquiry submissions
- CORS allowlist for Vercel frontend domains
- Structured routes/controllers/middleware
- Global and route-level rate limiting
- Centralized 404 and error handling

## Folder Structure

```txt
backend/
  app.js
  server.js
  .env.example
  package.json
  config/
    db.js
    cors.js
  controllers/
    authController.js
    inquiryController.js
  middleware/
    auth.js
    errorMiddleware.js
    rateLimit.js
  models/
    ClientInquiry.js
    User.js
  routes/
    auth.js
    inquiries.js
    admin.js
  services/
    bootstrapService.js
    emailService.js
    whatsappService.js
  validators/
    authValidator.js
    inquiryValidator.js
```

## Environment Variables

1. Copy `.env.example` to `.env`.
2. Fill all required values for Atlas, JWT, CORS, email, and optional Twilio.

Important:
- Set `MONGO_URI` to your Atlas URI.
- Set `CORS_ORIGIN` to include your Vercel domain, for example:
  - `http://localhost:5173,https://your-frontend.vercel.app`
- If you want Vercel preview URLs enabled, set:
  - `ALLOW_VERCEL_PREVIEWS=true`

## Local Development

```bash
cd backend
npm install
npm run dev
```

Health check:
- `GET http://localhost:5000/api/health`

Root route:
- `GET http://localhost:5000/`

## API Routes

- `POST /api/inquiries` (create inquiry)
- `GET /api/inquiries/my` (user's inquiries, auth required)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile` (auth required)
- `GET /api/admin/metrics` (admin only)
- `GET /api/admin/inquiries` (admin only)
- `PATCH /api/admin/inquiries/:id` (admin only)
- `GET /api/health`

Backward-compatible aliases are also enabled:
- `POST /api/enquiry`
- `POST /api/enquiries`

Sample payload (simple contact form):

```json
{
  "name": "Dip",
  "email": "dip@example.com",
  "message": "Need a landing page for my startup."
}
```

Sample payload (detailed inquiry form):

```json
{
  "name": "Dip",
  "phone": "+911234567890",
  "email": "dip@example.com",
  "projectType": "Portfolio Website",
  "budget": "50000 INR",
  "requirements": "Need React frontend, admin panel, and deployment.",
  "timeline": "4 weeks"
}
```

## Deploy to Render

1. Push repository to GitHub.
2. In Render, create a new **Web Service** from your repo.
3. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Runtime: Node
4. Add environment variables from `.env.example` in Render dashboard.
5. Deploy and verify:
   - `https://your-render-service.onrender.com/`
   - `https://your-render-service.onrender.com/api/health`

## Connect Vercel Frontend

In Vercel project settings, set:

```env
VITE_API_URL=https://your-render-service.onrender.com
```

The frontend client appends `/api` automatically, so requests become:
- `POST https://your-render-service.onrender.com/api/inquiries`

If frontend and backend are updated, redeploy both projects.
