import winston from 'winston';

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      )
    }),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

export const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const generateGuestName = () => {
  const adjectives = ['Happy', 'Clever', 'Swift', 'Bold', 'Cool', 'Wild', 'Zen', 'Hyper'];
  const nouns = ['Fox', 'Owl', 'Bear', 'Wolf', 'Hawk', 'Lion', 'Tiger', 'Eagle'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 1000);
  return `${adj}${noun}${num}`;
};

export const validateUsername = (username) => {
  if (!username || typeof username !== 'string') return false;
  const clean = username.trim();
  if (clean.length < 3 || clean.length > 20) return false;
  if (!/^[a-zA-Z0-9_-]+$/.test(clean)) return false;
  return true;
};

export const sanitizeMessage = (message) => {
  if (!message || typeof message !== 'string') return '';
  return message
    .trim()
    .slice(0, 500)
    .replace(/[<>]/g, '');
};

export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
