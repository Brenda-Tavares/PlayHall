import Room from '../models/Room.js';
import User from '../models/User.js';
import { shuffleArray } from '../utils/helpers.js';

export const start = async (socket, data, io, callback) => {
  const { roomId } = data;
  const room = await Room.findById(roomId);

  if (!room) {
    return callback?.({ error: 'Room not found' });
  }

  const isHost = room.players.some(
    p => p.user?.toString() === socket.user?._id?.toString() && p.role === 'host'
  );

  if (!isHost) {
    return callback?.({ error: 'Only host can start game' });
  }

  const minPlayers = getMinPlayers(room.gameType);
  if (room.players.length < minPlayers) {
    return callback?.({ error: `Need at least ${minPlayers} players` });
  }

  room.currentGame = {
    state: 'playing',
    gameId: `game-${Date.now()}`,
    data: initializeGameState(room.gameType, room.players)
  };

  await room.save();

  io.to(`room:${roomId}`).emit('game:started', {
    gameType: room.gameType,
    gameId: room.currentGame.gameId,
    state: room.currentGame.data,
    players: room.players.map(p => ({
      userId: p.user,
      role: p.role
    }))
  });

  callback?.({ success: true });
};

export const action = async (socket, data, io, callback) => {
  const { roomId, action, payload } = data;
  const room = await Room.findById(roomId);

  if (!room || !room.currentGame || room.currentGame.state !== 'playing') {
    return callback?.({ error: 'No active game' });
  }

  const player = room.players.find(
    p => p.user?.toString() === socket.user?._id?.toString()
  );

  if (!player) {
    return callback?.({ error: 'Not a player in this room' });
  }

  let gameResult;

  switch (room.gameType) {
    case 'pictionary':
      gameResult = handlePictionaryAction(room, player, action, payload);
      break;
    case 'charadas':
      gameResult = handleCharadasAction(room, player, action, payload);
      break;
    case 'trivia':
    case 'caca-palavras':
    case 'jogo-do-milhao':
      gameResult = handleQuizAction(room, player, action, payload);
      break;
    case 'stop':
      gameResult = handleStopAction(room, player, action, payload);
      break;
    case 'cartas-falantes':
      gameResult = handleCartasFalantesAction(room, player, action, payload);
      break;
    case 'uno':
      gameResult = handleUnoAction(room, player, action, payload);
      break;
    case 'ludo':
    case 'damas':
    case 'xadrez':
    case 'batalha-naval':
    case 'jogo-da-velha':
    case 'conecta-4':
    case 'reversi':
      gameResult = handleBoardGameAction(room, player, action, payload);
      break;
    case 'memory':
      gameResult = handleMemoryAction(room, player, action, payload);
      break;
    case 'among-us':
      gameResult = handleAmongUsAction(room, player, action, payload);
      break;
    default:
      gameResult = { error: 'Unknown game type' };
  }

  if (gameResult.stateUpdate) {
    room.currentGame.data = gameResult.stateUpdate;
    await room.save();
  }

  io.to(`room:${roomId}`).emit('game:update', {
    action,
    payload: gameResult.payload,
    state: gameResult.stateUpdate || room.currentGame.data
  });

  if (gameResult.gameOver) {
    room.currentGame.state = 'finished';
    await room.save();
    
    io.to(`room:${roomId}`).emit('game:ended', {
      winner: gameResult.winner,
      scores: gameResult.scores
    });

    for (const player of room.players) {
      if (player.user) {
        const user = await User.findById(player.user);
        if (user) {
          user.stats.gamesPlayed++;
          if (gameResult.winner?.includes(player.user.toString())) {
            user.stats.gamesWon++;
          }
          await user.save();
        }
      }
    }
  }

  callback?.(gameResult);
};

export const end = async (socket, data, io, callback) => {
  const { roomId } = data;
  const room = await Room.findById(roomId);

  if (!room) return;

  const isHost = room.players.some(
    p => p.user?.toString() === socket.user?._id?.toString() && p.role === 'host'
  );

  if (!isHost) return;

  room.currentGame = {
    state: 'waiting',
    gameId: null,
    data: null
  };

  for (const player of room.players) {
    player.isReady = false;
  }

  await room.save();

  io.to(`room:${roomId}`).emit('game:ended', { reason: 'host-ended' });
  callback?.({ success: true });
};

function getMinPlayers(gameType) {
  const minPlayers = {
    pictionary: 3,
    charadas: 3,
    'quebra-cabeca': 2,
    ludo: 2,
    damas: 2,
    xadrez: 2,
    'batalha-naval': 2,
    'jogo-da-velha': 2,
    'conecta-4': 2,
    reversi: 2,
    'cartas-falantes': 3,
    'story-cards': 3,
    uno: 2,
    memory: 2,
    'stop': 3,
    trivia: 2,
    'caca-palavras': 2,
    'jogo-do-milhao': 3,
    'among-us': 5
  };
  return minPlayers[gameType] || 2;
}

function initializeGameState(gameType, players) {
  const baseState = {
    currentRound: 1,
    totalRounds: 5,
    scores: {}
  };

  players.forEach(p => {
    if (p.user) {
      baseState.scores[p.user.toString()] = 0;
    }
  });

  switch (gameType) {
    case 'pictionary':
      return {
        ...baseState,
        currentDrawer: 0,
        word: null,
        usedWords: [],
        timeLeft: 60
      };
    case 'charadas':
      return {
        ...baseState,
        currentActor: 0,
        currentWord: null,
        timeLeft: 60
      };
    case 'trivia':
    case 'jogo-do-milhao':
      return {
        ...baseState,
        currentQuestion: 0,
        questions: shuffleArray(TRIVIA_QUESTIONS).slice(0, 10)
      };
    case 'caca-palavras':
      return {
        ...baseState,
        grid: generateWordSearch(),
        words: [],
        foundWords: {}
      };
    case 'stop':
      return {
        ...baseState,
        currentLetter: null,
        categories: ['Nome', 'Cidade', 'Animal', 'Fruta', 'Profissão'],
        submissions: {}
      };
    case 'cartas-falantes':
      return {
        ...baseState,
        deck: shuffleArray(CARTAS_SUBJECT.concat(CARTAS_CONTEXT).concat(CARTAS_COMPLEMENT)),
        currentDrawer: 0,
        phrases: {},
        votes: {},
        phase: 'combine'
      };
    case 'uno':
      return {
        ...baseState,
        deck: shuffleArray(UNO_CARDS),
        discardPile: [],
        currentPlayer: 0,
        direction: 1,
        currentColor: null,
        currentValue: null
      };
    case 'memory':
      return {
        ...baseState,
        cards: shuffleArray([...MEMORY_ICONS, ...MEMORY_ICONS]),
        flipped: [],
        matched: [],
        turns: 0
      };
    case 'among-us':
      return {
        ...baseState,
        phase: 'setup',
        impostors: [],
        tasks: [],
        votes: {},
        bodyReported: false
      };
    default:
      return baseState;
  }
}

function handlePictionaryAction(room, player, action, payload) {
  const state = room.currentGame.data;

  if (action === 'set-word' && state.currentDrawer === room.players.indexOf(player)) {
    return {
      payload: { word: payload.word },
      stateUpdate: { ...state, word: payload.word, timeLeft: 60 }
    };
  }

  if (action === 'guess') {
    const isCorrect = payload.guess.toLowerCase() === state.word?.toLowerCase();
    
    if (isCorrect) {
      state.scores[player.user.toString()] += 10;
      return {
        payload: { correct: true, guesser: player.user.toString() },
        stateUpdate: state
      };
    }

    return { payload: { correct: false, guess: payload.guess } };
  }

  if (action === 'tick') {
    state.timeLeft--;
    if (state.timeLeft <= 0) {
      state.currentDrawer = (state.currentDrawer + 1) % room.players.length;
      state.word = null;
      state.timeLeft = 60;
    }
    return { stateUpdate: state };
  }

  return {};
}

function handleCharadasAction(room, player, action, payload) {
  const state = room.currentGame.data;

  if (action === 'give-hint') {
    return {
      payload: { hint: payload.hint },
      stateUpdate: state
    };
  }

  if (action === 'guess') {
    const isCorrect = payload.guess.toLowerCase() === state.currentWord?.toLowerCase();
    
    if (isCorrect) {
      state.scores[player.user.toString()] += 10;
      return {
        payload: { correct: true, guesser: player.user.toString() },
        stateUpdate: state
      };
    }

    return { payload: { correct: false } };
  }

  if (action === 'tick') {
    state.timeLeft--;
    if (state.timeLeft <= 0) {
      state.currentActor = (state.currentActor + 1) % room.players.length;
      state.currentWord = null;
      state.timeLeft = 60;
    }
    return { stateUpdate: state };
  }

  return {};
}

function handleQuizAction(room, player, action, payload) {
  const state = room.currentGame.data;
  const question = state.questions[state.currentQuestion];

  if (action === 'answer') {
    const isCorrect = payload.answer === question.correctAnswer;
    
    if (isCorrect) {
      state.scores[player.user.toString()] = (state.scores[player.user.toString()] || 0) + 1;
    }

    const gameOver = state.currentQuestion >= state.questions.length - 1;
    
    if (!gameOver) {
      state.currentQuestion++;
    }

    return {
      payload: { correct: isCorrect, rightAnswer: question.correctAnswer },
      stateUpdate: state,
      gameOver,
      winner: gameOver ? getWinner(state.scores) : null
    };
  }

  return {};
}

function handleStopAction(room, player, action, payload) {
  const state = room.currentGame.data;

  if (action === 'set-letter') {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    return {
      payload: { letter: payload.letter || letters[Math.floor(Math.random() * letters.length)] },
      stateUpdate: { ...state, currentLetter: payload.letter || 'A' }
    };
  }

  if (action === 'submit') {
    state.submissions[player.user.toString()] = payload.answers;
    return {
      payload: { submitted: true },
      stateUpdate: state
    };
  }

  return {};
}

function handleCartasFalantesAction(room, player, action, payload) {
  const state = room.currentGame.data;
  const playerIndex = room.players.findIndex(p => p.user?.toString() === player.user?.toString());

  if (action === 'draw-cards') {
    const cards = state.deck.splice(0, 3);
    return {
      payload: { cards },
      stateUpdate: state
    };
  }

  if (action === 'submit-phrase') {
    state.phrases[player.user.toString()] = payload.phrase;
    
    if (Object.keys(state.phrases).length === room.players.length) {
      state.phase = 'voting';
    }

    return {
      payload: { submitted: true },
      stateUpdate: state
    };
  }

  if (action === 'vote') {
    state.votes[player.user.toString()] = payload.votedFor;
    
    if (Object.keys(state.votes).length === room.players.length) {
      const counts = {};
      Object.values(state.votes).forEach(voted => {
        counts[voted] = (counts[voted] || 0) + 1;
      });

      const mostVoted = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
      state.scores[mostVoted] = (state.scores[mostVoted] || 0) + 3;

      Object.entries(state.votes).forEach(([voter, voted]) => {
        if (voted === state.phrases[voted]) {
          state.scores[voter] = (state.scores[voter] || 0) + 2;
        }
      });

      state.phase = 'reveal';
    }

    return {
      payload: { voted: true },
      stateUpdate: state
    };
  }

  return {};
}

function handleUnoAction(room, player, action, payload) {
  const state = room.currentGame.data;
  const playerIndex = room.players.indexOf(player);

  if (state.currentPlayer !== playerIndex) {
    return { error: 'Not your turn' };
  }

  if (action === 'play-card') {
    const card = payload.card;
    
    if (canPlayCard(card, state)) {
      state.discardPile.push(card);
      state.currentColor = card.color;
      state.currentValue = card.value;

      if (card.value === 'reverse') {
        state.direction *= -1;
      }
      if (card.value === 'skip') {
        state.currentPlayer = (state.currentPlayer + state.direction + room.players.length) % room.players.length;
      }
      if (card.value === '+2') {
        state.currentPlayer = (state.currentPlayer + state.direction + room.players.length) % room.players.length;
      }

      state.currentPlayer = (state.currentPlayer + state.direction + room.players.length) % room.players.length;

      const gameOver = checkUnoWin(state, playerIndex);
      if (gameOver) {
        state.winner = player.user?.toString();
      }

      return { stateUpdate: state, gameOver };
    }
  }

  if (action === 'draw') {
    const drawn = state.deck.splice(0, 1)[0];
    return {
      payload: { card: drawn },
      stateUpdate: state
    };
  }

  return {};
}

function handleBoardGameAction(room, player, action, payload) {
  const state = room.currentGame.data;
  const playerIndex = room.players.indexOf(player);

  switch (room.gameType) {
    case 'jogo-da-velha':
      return handleTicTacToe(room, state, playerIndex, action, payload);
    case 'conecta-4':
      return handleConnect4(room, state, playerIndex, action, payload);
    default:
      return {};
  }
}

function handleTicTacToe(room, state, playerIndex, action, payload) {
  const symbol = playerIndex === 0 ? 'X' : 'O';

  if (action === 'move') {
    const { row, col } = payload;
    
    if (state.board[row][col]) {
      return { error: 'Cell occupied' };
    }

    state.board[row][col] = symbol;

    const winner = checkTicTacToeWin(state.board);
    if (winner) {
      return {
        stateUpdate: state,
        gameOver: true,
        winner: winner === 'X' ? [room.players[0].user?.toString()] : [room.players[1].user?.toString()]
      };
    }

    if (isBoardFull(state.board)) {
      return { stateUpdate: state, gameOver: true, winner: [] };
    }

    state.currentPlayer = 1 - state.currentPlayer;
    return { stateUpdate: state };
  }

  return {};
}

function handleConnect4(room, state, playerIndex, action, payload) {
  const symbol = playerIndex === 0 ? 'R' : 'Y';

  if (action === 'drop') {
    const { col } = payload;
    
    const row = getLowestEmptyRow(state.board, col);
    if (row === -1) {
      return { error: 'Column full' };
    }

    state.board[row][col] = symbol;

    const winner = checkConnect4Win(state.board);
    if (winner) {
      return {
        stateUpdate: state,
        gameOver: true,
        winner: winner === 'R' ? [room.players[0].user?.toString()] : [room.players[1].user?.toString()]
      };
    }

    state.currentPlayer = 1 - state.currentPlayer;
    return { stateUpdate: state };
  }

  return {};
}

function handleMemoryAction(room, player, action, payload) {
  const state = room.currentGame.data;

  if (action === 'flip') {
    const { index } = payload;
    
    if (state.flipped.includes(index) || state.matched.includes(index)) {
      return {};
    }

    state.flipped.push(index);

    if (state.flipped.length === 2) {
      const [a, b] = state.flipped;
      const match = state.cards[a] === state.cards[b];
      
      state.turns++;

      if (match) {
        state.matched.push(a, b);
        state.flipped = [];

        if (state.matched.length === state.cards.length) {
          return {
            stateUpdate: state,
            gameOver: true,
            winner: [player.user?.toString()],
            scores: { turns: state.turns }
          };
        }
      } else {
        setTimeout(() => {
          state.flipped = [];
        }, 1000);
      }
    }

    return { stateUpdate: state };
  }

  return {};
}

function handleAmongUsAction(room, player, action, payload) {
  const state = room.currentGame.data;

  if (action === 'start-game') {
    const numImpostors = room.players.length >= 7 ? 2 : 1;
    const shuffled = shuffleArray(room.players.map(p => p.user?.toString()));
    
    state.impostors = shuffled.splice(0, numImpostors);
    state.phase = 'playing';
    state.tasks = generateTasks(room.players.length - numImpostors);

    return { stateUpdate: state };
  }

  if (action === 'vote') {
    state.votes[player.user?.toString()] = payload.votedFor;
    return { stateUpdate: state };
  }

  return {};
}

function getWinner(scores) {
  const max = Math.max(...Object.values(scores));
  return Object.entries(scores).filter(([, s]) => s === max).map(([k]) => k);
}

function generateWordSearch() {
  const size = 10;
  const words = ['PLAY', 'HALL', 'GAME', 'CHAT', 'FUN', 'JOGO', 'SALA'];
  const grid = Array(size).fill(null).map(() => Array(size).fill(''));
  
  words.forEach(word => {
    let placed = false;
    while (!placed) {
      const dir = Math.random() > 0.5 ? 'H' : 'V';
      const maxRow = dir === 'V' ? size - word.length : size;
      const maxCol = dir === 'H' ? size - word.length : size;
      const row = Math.floor(Math.random() * maxRow);
      const col = Math.floor(Math.random() * maxCol);

      let canPlace = true;
      for (let i = 0; i < word.length; i++) {
        const r = dir === 'V' ? row + i : row;
        const c = dir === 'H' ? col + i : col;
        if (grid[r][c] && grid[r][c] !== word[i]) {
          canPlace = false;
          break;
        }
      }

      if (canPlace) {
        for (let i = 0; i < word.length; i++) {
          const r = dir === 'V' ? row + i : row;
          const c = dir === 'H' ? col + i : col;
          grid[r][c] = word[i];
        }
        placed = true;
      }
    }
  });

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r][c]) {
        grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
    }
  }

  return grid;
}

function generateTasks(numPlayers) {
  const allTasks = [
    'Fix wiring', 'Empty garbage', 'Download data',
    'Start reactor', 'Unlock doors', 'Inspect sample',
    'Fuel engines', 'Calibrate distributor'
  ];
  return shuffleArray(allTasks).slice(0, numPlayers * 2);
}

function canPlayCard(card, state) {
  if (!state.currentColor && !state.currentValue) return true;
  if (card.color === state.currentColor) return true;
  if (card.value === state.currentValue) return true;
  if (card.value === 'wild') return true;
  return false;
}

function checkUnoWin(state, playerIndex) {
  return false;
}

function checkTicTacToeWin(board) {
  const lines = [
    [[0,0],[0,1],[0,2]], [[1,0],[1,1],[1,2]], [[2,0],[2,1],[2,2]],
    [[0,0],[1,0],[2,0]], [[0,1],[1,1],[2,1]], [[0,2],[1,2],[2,2]],
    [[0,0],[1,1],[2,2]], [[0,2],[1,1],[2,0]]
  ];

  for (const line of lines) {
    const [a, b, c] = line;
    if (board[a[0]][a[1]] && 
        board[a[0]][a[1]] === board[b[0]][b[1]] &&
        board[a[0]][a[1]] === board[c[0]][c[1]]) {
      return board[a[0]][a[1]];
    }
  }
  return null;
}

function isBoardFull(board) {
  return board.every(row => row.every(cell => cell));
}

function checkConnect4Win(board) {
  const rows = 6, cols = 7;
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r][c];
      if (!cell) continue;
      
      if (c + 3 < cols &&
          cell === board[r][c+1] &&
          cell === board[r][c+2] &&
          cell === board[r][c+3]) {
        return cell;
      }
      
      if (r + 3 < rows &&
          cell === board[r+1][c] &&
          cell === board[r+2][c] &&
          cell === board[r+3][c]) {
        return cell;
      }
      
      if (r + 3 < rows && c + 3 < cols &&
          cell === board[r+1][c+1] &&
          cell === board[r+2][c+2] &&
          cell === board[r+3][c+3]) {
        return cell;
      }
      
      if (r + 3 < rows && c - 3 >= 0 &&
          cell === board[r+1][c-1] &&
          cell === board[r+2][c-2] &&
          cell === board[r+3][c-3]) {
        return cell;
      }
    }
  }
  return null;
}

function getLowestEmptyRow(board, col) {
  for (let r = board.length - 1; r >= 0; r--) {
    if (!board[r][col]) return r;
  }
  return -1;
}

const TRIVIA_QUESTIONS = [
  { question: 'What is the capital of France?', options: ['Paris', 'London', 'Berlin', 'Madrid'], correctAnswer: 'Paris' },
  { question: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correctAnswer: '4' },
  { question: 'Who wrote Hamlet?', options: ['Shakespeare', 'Hemingway', 'Fitzgerald', 'Austen'], correctAnswer: 'Shakespeare' }
];

const CARTAS_SUBJECT = [
  'The CEO', 'Grandma', 'The emo teenager', 'The firefighter',
  'The strict librarian', 'The party clown', 'The spy',
  'The time traveler', 'The robot', 'The wizard'
];

const CARTAS_CONTEXT = [
  'at a wedding', 'while cooking', 'during a meeting', 'at the gym',
  'on a first date', 'at a funeral', 'while driving', 'at the beach',
  'in a elevator', 'at the zoo'
];

const CARTAS_COMPLEMENT = [
  'with flip-flops', 'with a rubber duck', 'screaming curses',
  'dancing badly', 'sleepwalking', 'with a cape',
  'singing opera', 'in slow motion'
];

const UNO_CARDS = [
  { color: 'red', value: '0' }, { color: 'red', value: '1' }, { color: 'red', value: '2' },
  { color: 'blue', value: '0' }, { color: 'blue', value: '1' }, { color: 'blue', value: '2' },
  { color: 'green', value: '0' }, { color: 'green', value: '1' }, { color: 'green', value: '2' },
  { color: 'yellow', value: '0' }, { color: 'yellow', value: '1' }, { color: 'yellow', value: '2' },
  { color: 'wild', value: 'wild' }, { color: '+2', value: '+2' },
  { color: 'skip', value: 'skip' }, { color: 'reverse', value: 'reverse' }
];

const MEMORY_ICONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
