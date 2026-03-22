import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  hasPassword: {
    type: Boolean,
    default: false
  },
  passwordHash: {
    type: String,
    default: null
  },
  region: {
    type: String,
    enum: ['national', 'international'],
    default: 'international'
  },
  country: {
    type: String,
    default: null
  },
  gameType: {
    type: String,
    required: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  players: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    socketId: String,
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isReady: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      enum: ['host', 'player'],
      default: 'player'
    }
  }],
  maxPlayers: {
    type: Number,
    default: 8,
    min: 2,
    max: 20
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  currentGame: {
    state: {
      type: String,
      enum: ['waiting', 'starting', 'playing', 'finished'],
      default: 'waiting'
    },
    gameId: String,
    data: mongoose.Schema.Types.Mixed
  },
  voiceEnabled: {
    type: Boolean,
    default: true
  },
  chatHistory: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  settings: {
    allowSpectators: { type: Boolean, default: false },
    autoStart: { type: Boolean, default: false },
    turnTimeLimit: { type: Number, default: 60 }
  }
}, {
  timestamps: true
});

roomSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    name: this.name,
    region: this.region,
    country: this.country,
    gameType: this.gameType,
    host: this.host,
    playerCount: this.players.length,
    maxPlayers: this.maxPlayers,
    isPublic: this.isPublic,
    hasPassword: this.hasPassword,
    currentGame: this.currentGame?.state || 'waiting',
    voiceEnabled: this.voiceEnabled,
    createdAt: this.createdAt
  };
};

roomSchema.methods.getPlayerCount = function() {
  return this.players.length;
};

roomSchema.methods.isFull = function() {
  return this.players.length >= this.maxPlayers;
};

roomSchema.methods.hasPlayer = function(userId) {
  return this.players.some(p => p.user.toString() === userId.toString());
};

export default mongoose.model('Room', roomSchema);
