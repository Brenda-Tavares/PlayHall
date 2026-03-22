'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

const translations = {
  en: {
    common: { playhall: 'PlayHall', loading: 'Loading...', error: 'Error', success: 'Success', cancel: 'Cancel', confirm: 'Confirm', save: 'Save', delete: 'Delete', edit: 'Edit', close: 'Close', back: 'Back', next: 'Next', previous: 'Previous', search: 'Search', noResults: 'No results found' },
    auth: { login: 'Login', register: 'Register', logout: 'Logout', email: 'Email', password: 'Password', username: 'Username', confirmPassword: 'Confirm Password', noAccount: "Don't have an account?", haveAccount: 'Already have an account?', orContinueAs: 'Or continue as', guest: 'Guest', guestNotice: 'You can play as guest. Your progress will not be saved.', loginWithGoogle: 'Login with Google', loginWithDiscord: 'Login with Discord', loginError: 'Login failed. Check your credentials.', registerError: 'Registration failed.' },
    lobby: { title: 'Game Lobby', createRoom: 'Create Room', joinRoom: 'Join Room', publicRooms: 'Public Rooms', privateRoom: 'Private Room', friends: 'Friends', online: 'Online', inGame: 'In Game', createNewRoom: 'Create New Room', roomName: 'Room Name', roomNamePlaceholder: 'Enter room name or leave blank for auto-generated', gameType: 'Game Type', selectGame: 'Select a game', region: 'Region', national: 'National', international: 'International', maxPlayers: 'Max Players', password: 'Password', passwordOptional: 'Password (optional)', enterPassword: 'Enter password', noRoomsAvailable: 'No rooms available', createFirstRoom: 'Be the first to create a room!', create: 'Create', cancel: 'Cancel' },
    room: { waiting: 'Waiting for players...', players: 'Players', host: 'Host', ready: 'Ready', notReady: 'Not Ready', startGame: 'Start Game', leaveRoom: 'Leave Room', settings: 'Room Settings', chat: 'Chat', voiceChat: 'Voice Chat', typeMessage: 'Type a message...', send: 'Send', mute: 'Mute', unmute: 'Unmute', joinVoice: 'Join Voice', leaveVoice: 'Leave Voice', copyLink: 'Copy Room Link', linkCopied: 'Link copied!', notHost: 'Not Host', waitingForHost: 'Waiting for host to start...', playersNeeded: 'players needed to start', yourRoom: 'Your Room' },
    games: { pictionary: 'Pictionary', charadas: 'Charades', trivia: 'Trivia', uno: 'Uno', memory: 'Memory', stop: 'Stop!', cartasFalantes: 'Talking Cards', amongUs: 'Among Us', cacaPalavras: 'Word Search', ludo: 'Ludo', xadrez: 'Chess', damas: 'Checkers', batalhaNaval: 'Battleship', jogoDaVelha: 'Tic-Tac-Toe', conecta4: 'Connect 4', reversi: 'Reversi', quebraCabeca: 'Puzzle', storyCards: 'Story Cards', jogoDoMilhao: 'Millionaire', draw: 'Draw', guess: 'Guess', word: 'Word', hint: 'Hint', yourTurn: 'Your Turn', waitingForPlayer: 'Waiting for player...', correct: 'Correct!', wrong: 'Wrong!', timeLeft: 'Time Left', round: 'Round', score: 'Score', winner: 'Winner', draw: 'Draw!', playAgain: 'Play Again', exitGame: 'Exit Game' },
    profile: { profile: 'Profile', stats: 'Statistics', gamesPlayed: 'Games Played', gamesWon: 'Games Won', winRate: 'Win Rate', achievements: 'Achievements', friends: 'Friends', addFriend: 'Add Friend', removeFriend: 'Remove Friend', settings: 'Settings', language: 'Language', theme: 'Theme', dark: 'Dark', light: 'Light', system: 'System', notifications: 'Notifications', soundEffects: 'Sound Effects' },
    errors: { roomNotFound: 'Room not found', roomFull: 'Room is full', wrongPassword: 'Wrong password', notHost: 'Only the host can do that', notInRoom: 'You are not in this room', gameInProgress: 'Game is already in progress', notEnoughPlayers: 'Not enough players to start' }
  },
  'pt-BR': {
    common: { playhall: 'PlayHall', loading: 'Carregando...', error: 'Erro', success: 'Sucesso', cancel: 'Cancelar', confirm: 'Confirmar', save: 'Salvar', delete: 'Excluir', edit: 'Editar', close: 'Fechar', back: 'Voltar', next: 'Proximo', previous: 'Anterior', search: 'Buscar', noResults: 'Nenhum resultado encontrado' },
    auth: { login: 'Entrar', register: 'Cadastrar', logout: 'Sair', email: 'Email', password: 'Senha', username: 'Nome de usuario', confirmPassword: 'Confirmar Senha', noAccount: 'Nao tem conta?', haveAccount: 'Ja tem conta?', orContinueAs: 'Ou continue como', guest: 'Visitante', guestNotice: 'Voce pode jogar como visitante. Seu progresso nao sera salvo.', loginWithGoogle: 'Entrar com Google', loginWithDiscord: 'Entrar com Discord', loginError: 'Falha no login. Verifique suas credenciais.', registerError: 'Falha no cadastro.' },
    lobby: { title: 'Lobby de Jogos', createRoom: 'Criar Sala', joinRoom: 'Entrar na Sala', publicRooms: 'Salas Publicas', privateRoom: 'Sala Privada', friends: 'Amigos', online: 'Online', inGame: 'Em Jogo', createNewRoom: 'Criar Nova Sala', roomName: 'Nome da Sala', roomNamePlaceholder: 'Digite o nome da sala ou deixe em branco para auto-gerado', gameType: 'Tipo de Jogo', selectGame: 'Selecione um jogo', region: 'Regiao', national: 'Nacional', international: 'Internacional', maxPlayers: 'Maximo de Jogadores', password: 'Senha', passwordOptional: 'Senha (opcional)', enterPassword: 'Digite a senha', noRoomsAvailable: 'Nenhuma sala disponivel', createFirstRoom: 'Seja o primeiro a criar uma sala!', create: 'Criar', cancel: 'Cancelar' },
    room: { waiting: 'Aguardando jogadores...', players: 'Jogadores', host: 'Anfitriao', ready: 'Pronto', notReady: 'Nao Pronto', startGame: 'Iniciar Jogo', leaveRoom: 'Sair da Sala', settings: 'Configuracoes', chat: 'Chat', voiceChat: 'Voz', typeMessage: 'Digite uma mensagem...', send: 'Enviar', mute: 'Silenciar', unmute: 'Ativar Som', joinVoice: 'Entrar na Voz', leaveVoice: 'Sair da Voz', copyLink: 'Copiar Link da Sala', linkCopied: 'Link copiado!', notHost: 'Nao e Anfitriao', waitingForHost: 'Aguardando anfitriao iniciar...', playersNeeded: 'jogadores necessarios para iniciar', yourRoom: 'Sua Sala' },
    games: { pictionary: 'Pictionary', charadas: 'Charadas', trivia: 'Trivia', uno: 'Uno', memory: 'Memoria', stop: 'Stop!', cartasFalantes: 'Cartas Falantes', amongUs: 'Among Us', cacaPalavras: 'Caca Palavras', ludo: 'Ludo', xadrez: 'Xadrez', damas: 'Damas', batalhaNaval: 'Batalha Naval', jogoDaVelha: 'Jogo da Velha', conecta4: 'Conecta 4', reversi: 'Reversi', quebraCabeca: 'Quebra-Cabeca', storyCards: 'Cartas de Historia', jogoDoMilhao: 'Jogo do Milhao', draw: 'Desenhar', guess: 'Adivinhar', word: 'Palavra', hint: 'Pista', yourTurn: 'Sua Vez', waitingForPlayer: 'Aguardando jogador...', correct: 'Correto!', wrong: 'Errado!', timeLeft: 'Tempo Restante', round: 'Rodada', score: 'Pontuacao', winner: 'Vencedor', draw: 'Empate!', playAgain: 'Jogar Novamente', exitGame: 'Sair do Jogo' },
    profile: { profile: 'Perfil', stats: 'Estatisticas', gamesPlayed: 'Jogos Jogados', gamesWon: 'Jogos Vencidos', winRate: 'Taxa de Vitorias', achievements: 'Conquistas', friends: 'Amigos', addFriend: 'Adicionar Amigo', removeFriend: 'Remover Amigo', settings: 'Configuracoes', language: 'Idioma', theme: 'Tema', dark: 'Escuro', light: 'Claro', system: 'Sistema', notifications: 'Notificacoes', soundEffects: 'Efeitos Sonoros' },
    errors: { roomNotFound: 'Sala nao encontrada', roomFull: 'Sala esta cheia', wrongPassword: 'Senha incorreta', notHost: 'Apenas o anfitriao pode fazer isso', notInRoom: 'Voce nao esta nesta sala', gameInProgress: 'Jogo ja esta em andamento', notEnoughPlayers: 'Jogadores insuficientes para iniciar' }
  },
  es: {
    common: { playhall: 'PlayHall', loading: 'Cargando...', error: 'Error', success: 'Exito', cancel: 'Cancelar', confirm: 'Confirmar', save: 'Guardar', delete: 'Eliminar', edit: 'Editar', close: 'Cerrar', back: 'Volver', next: 'Siguiente', previous: 'Anterior', search: 'Buscar', noResults: 'Sin resultados' },
    auth: { login: 'Iniciar sesion', register: 'Registrarse', logout: 'Cerrar sesion', email: 'Correo', password: 'Contrasena', username: 'Usuario', confirmPassword: 'Confirmar contrasena', noAccount: 'No tienes cuenta?', haveAccount: 'Ya tienes cuenta?', orContinueAs: 'O continuar como', guest: 'Invitado', guestNotice: 'Puedes jugar como invitado. Tu progreso no se guardara.', loginWithGoogle: 'Entrar con Google', loginWithDiscord: 'Entrar con Discord' },
    lobby: { title: 'Sala de Juegos', createRoom: 'Crear Sala', joinRoom: 'Unirse a Sala', publicRooms: 'Salas Publicas', privateRoom: 'Sala Privada', online: 'En linea', inGame: 'En Juego', createNewRoom: 'Crear Nueva Sala', roomName: 'Nombre de Sala', roomNamePlaceholder: 'Ingresa el nombre o deja en blanco', gameType: 'Tipo de Juego', selectGame: 'Selecciona un juego', region: 'Region', national: 'Nacional', international: 'Internacional', maxPlayers: 'Max Jugadores', password: 'Contrasena', passwordOptional: 'Contrasena (opcional)', noRoomsAvailable: 'No hay salas disponibles', createFirstRoom: 'Crea la primera sala!', create: 'Crear', cancel: 'Cancelar' },
    room: { waiting: 'Esperando jugadores...', players: 'Jugadores', host: 'Anfitrion', ready: 'Listo', notReady: 'No Listo', startGame: 'Iniciar Juego', leaveRoom: 'Salir de Sala', chat: 'Chat', voiceChat: 'Voz', typeMessage: 'Escribe un mensaje...', send: 'Enviar', mute: 'Silenciar', unmute: 'Activar', joinVoice: 'Unirse a Voz', leaveVoice: 'Salir de Voz' },
    games: { pictionary: 'Pictionary', charadas: 'Charadas', trivia: 'Trivia', uno: 'Uno', memory: 'Memoria', stop: 'Stop!', cartasFalantes: 'Cartas Hablantes', amongUs: 'Among Us' },
    errors: { roomNotFound: 'Sala no encontrada', roomFull: 'Sala llena', wrongPassword: 'Contrasena incorrecta' }
  },
  zh: {
    common: { playhall: 'PlayHall', loading: '加载中...', error: '错误', success: '成功', cancel: '取消', confirm: '确认', save: '保存', delete: '删除', edit: '编辑', close: '关闭', back: '返回', next: '下一个', search: '搜索', noResults: '无结果' },
    auth: { login: '登录', register: '注册', logout: '退出', email: '邮箱', password: '密码', username: '用户名', confirmPassword: '确认密码', noAccount: '没有账号?', haveAccount: '已有账号?', orContinueAs: '或继续作为', guest: '游客', guestNotice: '您可以游客身份游戏，进度不会保存', loginWithGoogle: 'Google登录', loginWithDiscord: 'Discord登录' },
    lobby: { title: '游戏大厅', createRoom: '创建房间', joinRoom: '加入房间', publicRooms: '公开房间', privateRoom: '私人房间', online: '在线', inGame: '游戏中', createNewRoom: '创建新房间', roomName: '房间名称', roomNamePlaceholder: '输入房间名称或留空自动生成', gameType: '游戏类型', selectGame: '选择游戏', region: '地区', national: '国内', international: '国际', maxPlayers: '最大玩家', password: '密码', passwordOptional: '密码（可选）', noRoomsAvailable: '没有可用房间', createFirstRoom: '成为第一个创建房间的人！', create: '创建', cancel: '取消' },
    room: { waiting: '等待玩家...', players: '玩家', host: '房主', ready: '准备', notReady: '未准备', startGame: '开始游戏', leaveRoom: '离开房间', chat: '聊天', voiceChat: '语音', typeMessage: '输入消息...', send: '发送', mute: '静音', unmute: '取消静音', joinVoice: '加入语音', leaveVoice: '离开语音' },
    games: { pictionary: '你画我猜', charadas: '猜词', trivia: '知识问答', uno: 'Uno', memory: '记忆', stop: '停止!', cartasFalantes: '说话卡片', amongUs: '狼人杀', cacaPalavras: '找单词' },
    errors: { roomNotFound: '房间未找到', roomFull: '房间已满', wrongPassword: '密码错误' }
  },
  ko: {
    common: { playhall: 'PlayHall', loading: '加载中...', error: '错误', success: '成功', cancel: '取消', confirm: '确认', save: '保存', delete: '删除', close: '关闭', back: '返回', next: '下一个', search: '搜索', noResults: '无结果' },
    auth: { login: '登录', register: '注册', logout: '退出', email: '邮箱', password: '密码', username: '用户名', noAccount: '无账号?', orContinueAs: '或者', guest: '游客', loginWithGoogle: 'Google登录', loginWithDiscord: 'Discord登录' },
    lobby: { title: '游戏大厅', createRoom: '创建房间', joinRoom: '加入', publicRooms: '公开', privateRoom: '私人', createNewRoom: '创建新房间', roomName: '房间名', gameType: '游戏', region: '地区', national: '国内', international: '国际', maxPlayers: '最大玩家', password: '密码', create: '创建', cancel: '取消' },
    room: { waiting: '等待...', players: '玩家', host: '房主', ready: '准备', startGame: '开始', leaveRoom: '离开', chat: '聊天', mute: '静音' },
    games: { pictionary: '绘画猜词', charadas: '猜词', trivia: '问答', uno: 'Uno', stop: '停止!' },
    errors: { roomNotFound: '无房间', roomFull: '已满' }
  },
  ja: {
    common: { playhall: 'PlayHall', loading: '加载...', error: '错误', success: '成功', cancel: '取消', confirm: '确认', save: '保存', delete: '删除', close: '关闭', back: '返回', next: '下一个', search: '搜索', noResults: '无结果' },
    auth: { login: '登录', register: '注册', logout: '退出', email: '邮箱', password: '密码', username: '用户名', guest: '游客', loginWithGoogle: 'Google登录' },
    lobby: { title: '游戏大厅', createRoom: '创建', joinRoom: '加入', roomName: '房间名', gameType: '游戏', region: '地区', create: '创建', cancel: '取消' },
    room: { waiting: '等待...', players: '玩家', host: '房主', ready: '准备', startGame: '开始', leaveRoom: '离开', chat: '聊天' },
    games: { pictionary: '绘画', charadas: '猜谜', trivia: '问答', uno: 'Uno', stop: '停止!' },
    errors: { roomNotFound: '无房间', roomFull: '已满' }
  },
  yue: {
    common: { playhall: 'PlayHall', loading: '加载...', error: '错误', success: '成功', cancel: '取消', confirm: '确认', close: '关闭', back: '返回' },
    auth: { login: '登录', register: '注册', logout: '退出', email: '邮箱', password: '密码', username: '用户名', guest: '游客' },
    lobby: { title: '游戏大厅', createRoom: '创建', joinRoom: '加入', roomName: '名称', create: '创建', cancel: '取消' },
    room: { waiting: '等待...', players: '玩家', host: '房主', startGame: '开始', leaveRoom: '离开', chat: '聊天' },
    games: { pictionary: '绘画', stop: '停止!' },
    errors: { roomNotFound: '无房间', roomFull: '已满' }
  }
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};

const languages = [
  { code: 'en', name: 'English', flag: 'US' },
  { code: 'pt-BR', name: 'Portugues (BR)', flag: 'BR' },
  { code: 'es', name: 'Espanol', flag: 'ES' },
  { code: 'zh', name: '中文 (简体)', flag: 'CN' },
  { code: 'ko', name: '한국어', flag: 'KR' },
  { code: 'ja', name: '日本語', flag: 'JP' },
  { code: 'yue', name: '中文 (粤语)', flag: 'HK' }
];

export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState('en');
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedLocale = localStorage.getItem('playhall_locale');
    const savedTheme = localStorage.getItem('playhall_theme') || 'dark';
    
    let detectedLocale = savedLocale;
    if (!savedLocale) {
      const browserLocale = navigator.language;
      if (browserLocale.startsWith('pt')) detectedLocale = 'pt-BR';
      else if (browserLocale.startsWith('es')) detectedLocale = 'es';
      else if (browserLocale.startsWith('zh')) detectedLocale = 'zh';
      else if (browserLocale.startsWith('ko')) detectedLocale = 'ko';
      else if (browserLocale.startsWith('ja')) detectedLocale = 'ja';
      else if (browserLocale.startsWith('yue')) detectedLocale = 'yue';
    }
    
    setLocale(detectedLocale || 'en');
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.lang = detectedLocale || 'en';
  }, []);

  const changeLocale = (newLocale) => {
    setLocale(newLocale);
    localStorage.setItem('playhall_locale', newLocale);
    document.documentElement.lang = newLocale;
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('playhall_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const t = (key, fallback = key) => {
    const keys = key.split('.');
    let result = translations[locale] || translations.en;
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) result = result[k];
      else return fallback;
    }
    return result;
  };

  return (
    <LanguageContext.Provider value={{ 
      locale, languages, changeLocale, t, 
      theme, changeTheme, isDark: theme === 'dark' 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};