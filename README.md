# Hotel Booking System

A full-stack hotel booking app with a customer-facing booking flow and an admin dashboard for managing hotels, customers, and feedback.

## Tech Stack

- **Frontend:** React (Vite) + CSS
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (Supabase)
- **Auth:** JWT (separate tokens for customers and admins)
- **Charts:** Recharts (admin dashboard)

## Features

### Customer
- Sign up / log in
- Browse and search hotels
- View hotel details and book rooms
- Profile page with booking history
- Leave a review after a completed stay

### Admin (`/admin`)
- Separate admin login and auth
- Dashboard overview — bookings, revenue, occupancy, and trend charts
- Hotels — full CRUD with auto-generated IDs and per-room-type pricing
- Customers — guest list with status and detail view
- Feedback — reviews with ratings, distribution, and sentiment tags

## Setup

```bash
cd backend
npm install

cd ../frontend
npm install
```

Create `backend/.env`:
```
DATABASE_URL=your_supabase_connection_string
JWT_SECRET=your_jwt_secret
```

Run both servers in separate terminals:
```bash
cd backend
node server.js
```
```bash
cd frontend
npm run dev
```

- App: `http://localhost:5173`
- Admin: `http://localhost:5173/admin/login`
- API: `http://localhost:5000`

## Database Tables

`users`, `admins`, `hotels`, `hotel_bookings`, `reviews`

## Notes

- Admin accounts are seeded manually — no public admin signup
- Profile account-details update isn't wired to a backend route yet
- Review sentiment is rating-based, not real NLP
