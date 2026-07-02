# StudyShare

Collaborative project planning tool for student group projects.

## Tech Stack
- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Express.js, Node.js, Prisma, PostgreSQL, Socket.io
- **Auth**: JWT with refresh token rotation

## Prerequisites
- Node.js (v18+)
- PostgreSQL (running locally or a cloud URL)

## Local Setup

Follow these steps to run Phase 1 infrastructure locally:

### 1. Database Setup
Create a local PostgreSQL database named `studyshare`:
```bash
createdb studyshare
```
*(If you are on Windows using pgAdmin, create the database manually using the UI).*

### 2. Configure Environment Variables
Inside both `server/` and `client/` directories, copy `.env.example` to `.env`:
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```
Ensure `DATABASE_URL` in `server/.env` points to your local database, e.g., `postgresql://postgres:password@localhost:5432/studyshare`.

### 3. Start the Backend
Navigate to the server folder, install dependencies, run migrations, and start the development server:
```bash
cd server
npm install
npx prisma migrate dev --name init
npm run dev
```

### 4. Start the Frontend
In a new terminal window, navigate to the client folder, install dependencies, and start Vite:
```bash
cd client
npm install
npm run dev
```

### 5. View the App
Open `http://localhost:5173` in your browser.

## Phase 1 Features Implemented
- PostgreSQL schema setup via Prisma
- Express backend with Socket.io room isolation
- JWT Authentication (register, login, refresh) routes
- React 19 Frontend with Tailwind and Framer Motion configured
- Route transitions and skeleton loader
- Centralized Socket Context

## Next Steps (Phase 2)
- React Beautiful DnD Kanban board UI
- Real-time task syncing via WebSockets
- Optimistic UI updates
