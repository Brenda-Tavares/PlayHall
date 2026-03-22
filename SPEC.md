# PlayHall - Specification Document

## 1. Project Overview

**Name**: PlayHall  
**Type**: Real-time multiplayer gaming platform with chat and voice  
**Description**: A worldwide platform where users can create/join rooms, chat, use voice, and play multiplayer games together.  
**Stack**: Node.js + Socket.io (backend), Next.js (frontend), WebRTC (voice)

---

## 2. Features

### 2.1 Authentication
| Method | Description |
|--------|-------------|
| Guest | Play without account (auto-generated name: "Guest-X7Y2") |
| Email/Password | Traditional registration |
| Google OAuth | Sign in with Google |
| Discord OAuth | Sign in with Discord |

### 2.2 User System
- Friend list (add/remove, see online status)
- Progress/stats (games played, wins, achievements)
- Favorite rooms
- Private chat with friends
- User profile with avatar

### 2.3 Room System
| Feature | Options |
|---------|---------|
| Name | Custom or auto-generated (e.g., "Room-8A3F") |
| Privacy | Public (open) or Private (password protected) |
| Region | National or International |
| Game Type | Any of the 19 games |
| Max Players | Configurable (default: 8) |
| Emoji Support | Yes (for room names and chat only) |

### 2.4 Chat System
- Real-time text chat via Socket.io
- Typing indicators
- Emoji support (chat messages and room names only)
- Room chat history (optional)

### 2.5 Voice System
- Optional - users choose to join voice or not
- Mute/unmute button
- Visual indicator for speakers
- WebRTC P2P (no media server = lower cost)
- PeerJS for WebRTC signaling

### 2.6 Internationalization (i18n)
- Auto-detect browser language
- Manual language selection (dropdown in header)
- Supported languages (11 total):
  - English (EN)
  - Portuguese - Brazil (PT-BR)
  - Spanish (ES)
  - French (FR)
  - German (DE)
  - Italian (IT)
  - Japanese (JA)
  - Chinese (ZH)
  - Russian (RU)
  - Korean (KO)
  - Arabic (AR) - with RTL support
- All game content is multilingual

---

## 3. Games (19 + 1)

### Creative/Drawing
1. **Pictionary** - One draws, others guess
2. **Charadas** - Give hints without forbidden words (swearing allowed, NO harassment/misogyny)
3. **Quebra-cabeça** - Collaborative puzzle solving

### Board/Classic
4. **Ludo** - Race pieces on board (2-4 players)
5. **Damas** - Capture opponent pieces (2 players)
6. **Xadrez** - Full chess with timer (2 players)
7. **Batalha Naval** - Place ships on grid (2 players)
8. **Jogo da Velha** - Classic 3x3 (2 players)
9. **Conecta 4** - Align 4 vertically (2 players)
10. **Reversi** - Surround opponent pieces (2 players)

### Cards
11. **Cartas Falantes** - Combine cards to form a phrase, others vote who best fits ⭐
12. **Story Cards** - Create stories with narrative cards
13. **Uno** - Match colors/numbers (2-8 players)
14. **Memory/Genius** - Match pairs (2-4 players)

### Party/Social
15. **Stop!** - Fill categories with letters
16. **Trivia** - Questions and answers with timer
17. **Caça Palavras** - Competitive word search with time limit
18. **Jogo do Milhão** - Millionaire-style quiz
19. **Among Us Style** - Social deduction (impostor vs crewmates)

---

## 4. Technical Architecture

### 4.1 Backend (Node.js)
```
backend/
├── src/
│   ├── index.js              # Entry point
│   ├── config/               # Environment, DB, OAuth
│   ├── middleware/           # Auth, i18n
│   ├── routes/               # REST API
│   ├── socket/               # Socket.io handlers
│   ├── games/                # Game logic
│   ├── models/               # Database schemas
│   └── utils/                # Helpers
```

### 4.2 Frontend (Next.js)
```
frontend/
├── src/
│   ├── app/                  # App Router pages
│   ├── components/           # UI components
│   ├── hooks/                # Custom hooks
│   ├── contexts/             # State management
│   ├── lib/                  # API clients
│   └── i18n/                 # Translations
```

### 4.3 Database
- MongoDB for user data, rooms, game state
- Redis (optional) for real-time caching

### 4.4 Hosting
- **Frontend**: Vercel (free tier)
- **Backend**: Railway/Render (free tier)
- **Database**: MongoDB Atlas (free tier)

---

## 5. UI/UX Guidelines

### 5.1 Design Principles
- **Clean**: Minimalist, modern interface
- **Accessible**: High contrast, screen reader support, keyboard navigation
- **Modern**: Current design trends, responsive (mobile-first)
- **No Emojis in UI**: Emojis are only available for room names and chat

### 5.2 Color Palette
- Primary: #6366F1 (Indigo)
- Secondary: #8B5CF6 (Purple)
- Background: #0F172A (Dark) / #F8FAFC (Light)
- Text: High contrast based on theme
- Accent: Dynamic based on game context

### 5.3 Typography
- Font: Inter or system sans-serif
- Sizes: Responsive scaling
- Weights: 400 (normal), 500 (medium), 700 (bold)

---

## 6. API Endpoints

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/guest` - Create guest session
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/discord` - Discord OAuth
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users/me` - Current user profile
- `PATCH /api/users/me` - Update profile
- `GET /api/users/:id` - Get user by ID
- `POST /api/users/friends` - Add friend
- `DELETE /api/users/friends/:id` - Remove friend
- `GET /api/users/friends` - List friends

### Rooms
- `GET /api/rooms` - List public rooms
- `POST /api/rooms` - Create room
- `GET /api/rooms/:id` - Get room details
- `PATCH /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room
- `POST /api/rooms/:id/join` - Join room
- `POST /api/rooms/:id/leave` - Leave room

---

## 7. Socket.io Events

### Room Events
- `room:create` - Create new room
- `room:join` - Join existing room
- `room:leave` - Leave room
- `room:update` - Room settings changed
- `room:player-joined` - New player joined
- `room:player-left` - Player left

### Chat Events
- `chat:message` - Send message
- `chat:typing` - Typing indicator
- `chat:history` - Get room chat history

### Voice Events
- `voice:join` - Join voice channel
- `voice:leave` - Leave voice channel
- `voice:offer` - WebRTC offer
- `voice:answer` - WebRTC answer
- `voice:ice-candidate` - ICE candidate
- `voice:toggle-mute` - Mute/unmute

### Game Events
- `game:start` - Start game
- `game:action` - Game-specific action
- `game:end` - Game ended
- `game:state` - Game state update

---

## 8. Security Considerations

- Password hashing with bcrypt
- JWT tokens for authentication
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- WebSocket authentication
- Room password protection (hashed)

---

## 9. Environment Variables

```
# Backend
DATABASE_URL=
JWT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=

# Frontend
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_WS_URL=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
NEXT_PUBLIC_DISCORD_CLIENT_ID=
```

---

## 10. Future Enhancements

- Tournaments/leaderboards
- Custom room themes
- Spectator mode
- Mobile app (React Native)
- Game replays
-表情 packs (premium)
