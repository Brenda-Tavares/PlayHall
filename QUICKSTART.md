# PlayHall - Quick Start Guide

## Prerequisites

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **MongoDB** - Choose one option:
   - Local: [Download MongoDB Community](https://www.mongodb.com/try/download/community)
   - Cloud: Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier)

## Quick Start (Windows)

Simply run:
```bash
start.bat
```

## Manual Start

### 1. Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**Or use MongoDB Atlas connection string in .env**

### 2. Start Backend

```bash
cd backend
npm install (if not done)
npm run dev
```
Backend will run on http://localhost:4000

### 3. Start Frontend

```bash
cd frontend
npm install (if not done)
npm run dev
```
Frontend will run on http://localhost:3000

### 4. Open Browser

Go to http://localhost:3000

## Testing Flow

1. **Home Page** - Click "Play as Guest" or create an account
2. **Lobby** - Create a room or join existing one
3. **Room** - Chat with other players, join voice, start games

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check MONGODB_URI in backend/.env

### Port Already in Use
- Backend uses port 4000
- Frontend uses port 3000
- Change ports in respective .env files if needed

### Socket Connection Error
- Make sure backend is running on port 4000
- Check NEXT_PUBLIC_WS_URL in frontend/.env.local

## Features to Test

- [ ] Guest login
- [ ] Account registration
- [ ] Create room (public/private)
- [ ] Join room
- [ ] Chat messaging
- [ ] Voice chat (join/mute/unmute)
- [ ] Start game
- [ ] Play a game (try Pictionary or Tic-Tac-Toe)
- [ ] Language selector (11 languages)

## OAuth (Google/Discord)

OAuth requires additional setup. Test the basic features first without OAuth.

To enable OAuth later:
1. Create OAuth credentials in Google Console / Discord Developer Portal
2. Add credentials to backend/.env
3. Restart backend
