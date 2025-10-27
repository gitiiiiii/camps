<<<<<<< HEAD
"# camps" 
=======
# College Transport - Scaffold

This project is a scaffold for a College Transportation System:
- Backend: Node.js, Express, EJS views, express-session with connect-mongo
- Database: MongoDB Atlas
- Frontend: EJS templates + simple CSS (in /backend/public)

## Setup

1. Copy `.env.example` to `backend/.env` and fill `MONGODB_URI` and `SESSION_SECRET`.
2. Install dependencies:
   ```
   cd backend
   npm install
   ```
3. Start the server:
   ```
   npm run dev
   ```
4. Open `http://localhost:5000`

Notes:
- Admins and drivers should be created directly in DB or via a small seed script.
- Drivers can update their location on `/tracking/update`.
- Students/faculty can view real-time-ish updates by selecting a route at `/tracking`.

>>>>>>> 52e33dbf70723f6b82b8be3288b750cae23e8668
"# camps" 
