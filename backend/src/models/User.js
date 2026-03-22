import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String
  },
  avatar: {
    type: String,
    default: null
  },
  isGuest: {
    type: Boolean,
    default: false
  },
  oauth: {
    google: {
      id: String,
      email: String
    },
    discord: {
      id: String,
      username: String
    }
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  friendRequests: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  stats: {
    gamesPlayed: { type: Number, default: 0 },
    gamesWon: { type: Number, default: 0 },
    totalPlaytime: { type: Number, default: 0 },
    byGame: {
      type: Map,
      of: {
        played: { type: Number, default: 0 },
        won: { type: Number, default: 0 }
      }
    }
  },
  achievements: [{
    id: String,
    name: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  settings: {
    language: { type: String, default: 'en' },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'dark' },
    notifications: { type: Boolean, default: true },
    soundEffects: { type: Boolean, default: true }
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['online', 'away', 'offline', 'in-game'],
    default: 'offline'
  },
  currentRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    default: null
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (this.isModified('passwordHash') && !this.isGuest) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  if (this.isGuest) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    username: this.username,
    avatar: this.avatar,
    isGuest: this.isGuest,
    stats: this.stats,
    achievements: this.achievements,
    status: this.status,
    lastSeen: this.lastSeen
  };
};

export default mongoose.model('User', userSchema);
