Backend Google Auth Setup

Required environment variables (backend):
- `GOOGLE_CLIENT_ID` — OAuth 2.0 Client ID from Google Cloud Console
- `JWT_SECRET` — secret for signing JWTs
- Database vars: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (already used by project)

Frontend env (Vite):
- Create `frontend/.env` with:

VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

Install dependencies:

# backend
cd backend
npm install

# frontend
cd ../frontend
npm install

Run servers:

# backend
cd backend
node server.js

# frontend
cd ../frontend
npm run dev

Manual test steps:
1. Open the frontend (usually http://localhost:5173) and go to `/login` or `/register`.
2. Google One Tap should prompt automatically if allowed, or click the "Continue with Google" button to trigger `window.google.accounts.id.prompt()`.
3. The frontend sends the received `idToken` to backend `POST /api/auth/google` which verifies the token and returns the app JWT + user info.

Troubleshooting:
- Ensure `GOOGLE_CLIENT_ID` matches the `VITE_GOOGLE_CLIENT_ID` value.
- Check browser console for "Google Identity Services not loaded" if the script failed to load.
- Check backend logs for `Google auth error:` messages.

Security note: treat `JWT_SECRET` and `GOOGLE_CLIENT_ID` as sensitive in production and do not commit `.env` files to source control.
