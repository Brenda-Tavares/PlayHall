export default {
  jwt: {
    secret: process.env.JWT_SECRET || 'playhall-secret-key-change-in-production',
    expiresIn: '7d'
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000'
  },
  room: {
    defaultMaxPlayers: 8,
    maxRoomNameLength: 50,
    passwordMinLength: 4
  },
  games: {
    minPlayers: {
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
    }
  },
  i18n: {
    defaultLanguage: 'en',
    supportedLanguages: [
      { code: 'en', name: 'English', flag: 'US' },
      { code: 'pt-BR', name: 'Portugues', flag: 'BR' },
      { code: 'es', name: 'Espanol', flag: 'ES' },
      { code: 'fr', name: 'Francais', flag: 'FR' },
      { code: 'de', name: 'Deutsch', flag: 'DE' },
      { code: 'it', name: 'Italiano', flag: 'IT' },
      { code: 'ja', name: '日本語', flag: 'JP' },
      { code: 'zh', name: '中文', flag: 'CN' },
      { code: 'ru', name: 'Русский', flag: 'RU' },
      { code: 'ko', name: '한국어', flag: 'KR' },
      { code: 'ar', name: 'العربية', flag: 'SA', rtl: true }
    ]
  }
};
