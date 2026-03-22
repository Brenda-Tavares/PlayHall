# PlayHall 🎮

**[English](#english) | [Portugues](#portugues)**

---

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/Node.js-18-green?style=for-the-badge&logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io" alt="Socket.io">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge">
</p>

---

## English

### About the Project

**PlayHall** is a real-time multiplayer gaming platform built with modern web technologies. It allows users to create and join game rooms, communicate via text and voice chat, and play various multiplayer games together.

### Key Features

| Feature | Description |
|---------|-------------|
| **Room System** | Create public or private rooms with custom names, passwords, and country filters |
| **Real-time Chat** | Instant messaging with all players in the room using Socket.io |
| **Voice Chat** | WebRTC-based voice communication with mute/unmute controls |
| **19+ Games** | Pictionary, Tic-Tac-Toe, Connect 4, Memory, Uno, Charades, Trivia, and more |
| **Multi-language** | Supports 7 languages (EN, PT-BR, ES, ZH, KO, JA, Cantonese) |
| **Theme System** | Dark/Light mode with modern, accessible UI |

### Tech Stack

- **Frontend**: Next.js 14, React, Zustand (State Management)
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB Atlas
- **Real-time**: WebSocket via Socket.io
- **Voice**: WebRTC with PeerJS
- **Authentication**: JWT + OAuth ready (Google/Discord)

### Getting Started

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/PlayHall.git

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Configure environment variables
cp backend/.env.example backend/.env
# Edit .env with your MongoDB Atlas connection string

# Run backend (terminal 1)
cd backend
npm run dev

# Run frontend (terminal 2)
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Project Structure

```
PlayHall/
├── backend/                    # Node.js + Express + Socket.io API
│   ├── src/
│   │   ├── config/             # Environment and app config
│   │   ├── models/             # MongoDB schemas (User, Room)
│   │   ├── routes/             # REST API endpoints
│   │   ├── socket/             # Socket.io event handlers
│   │   ├── games/              # Game logic implementation
│   │   └── utils/              # Helper functions
│   └── package.json
│
├── frontend/                   # Next.js 14 Application
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   ├── components/        # React components
│   │   ├── contexts/           # React contexts (Auth, Room, Language)
│   │   ├── hooks/              # Custom React hooks
│   │   └── i18n/               # Internationalization
│   └── package.json
│
├── SPEC.md                     # Detailed project specification
├── .gitignore
└── README.md
```

### Games Included

| Category | Games |
|----------|-------|
| **Drawing** | Pictionary |
| **Board** | Tic-Tac-Toe, Connect 4, Ludo, Chess, Checkers, Battleship, Reversi |
| **Cards** | Uno, Memory, Talking Cards, Story Cards |
| **Party** | Charades, Stop!, Trivia, Word Search, Millionaire, Among Us |

---

## Portugues

### Sobre o Projeto

**PlayHall** e uma plataforma de jogos multiplayer em tempo real construida com tecnologias web modernas. Permite criar salas, conversar por texto e voz, e jogar juntos.

### Principais Funcionalidades

| Funcao | Descricao |
|--------|-----------|
| **Salas** | Crie salas publicas ou privadas com senha e filtro por pais |
| **Chat em Tempo Real** | Mensagens instantaneas com Socket.io |
| **Chat de Voz** |Comunicacao por voz com mute/unmute |
| **19+ Jogos** | Pictionary, Jogo da Velha, Conecta 4, Memoria, Uno, Charadas, etc |
| **Multi-idioma** | 7 idiomas (EN, PT-BR, ES, ZH, KO, JA, Cantonense) |
| **Temas** | Modo claro/escuro com UI moderna |

### Tecnologias

- **Frontend**: Next.js 14, React, Zustand
- **Backend**: Node.js, Express, Socket.io
- **Banco de Dados**: MongoDB Atlas
- **Tempo Real**: WebSocket
- **Voz**: WebRTC

### Como Executar

```bash
# Clone o repositorio
git clone https://github.com/SEU_USUARIO/PlayHall.git

# Instale as dependencias do backend
cd backend
npm install

# Instale as dependencias do frontend
cd ../frontend
npm install

# Configure o .env
cp backend/.env.example backend/.env

# Execute o backend
cd backend
npm run dev

# Execute o frontend (outro terminal)
cd frontend
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### Estrutura do Projeto

```
PlayHall/
├── backend/                    # API Node.js + Express + Socket.io
│   └── src/
│       ├── config/             # Configuracoes
│       ├── models/             # Schemas do MongoDB
│       ├── routes/             # Endpoints da API
│       ├── socket/             # Eventos Socket.io
│       ├── games/              # Logica dos jogos
│       └── utils/              # Funcoes auxiliares
│
├── frontend/                   # Aplicativo Next.js 14
│   └── src/
│       ├── app/                # Paginas
│       ├── components/         # Componentes React
│       ├── contexts/           # Contextos (Auth, Room, Idioma)
│       └── i18n/               # Internationalizacao
```

---

### License

MIT License - feel free to use this project for your portfolio!

---

### Developed with 💜 by Alabaster Developer

Star this project if you found it useful! ⭐""  
