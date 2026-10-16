const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'lunari-development-secret-key-change-in-production-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Server-side token revocation store.
 * Stores invalidated token IDs (jti) or token hashes with expiration timestamp.
 * Expired entries are automatically swept.
 */
class TokenRevocationStore {
  constructor() {
    this.revokedTokens = new Map(); // key: jti/hash, value: expiryMs
    // Cleanup expired entries periodically (every 10 minutes)
    this.cleanupTimer = setInterval(() => this.cleanup(), 10 * 60 * 1000);
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  /**
   * Mark token as revoked until its original expiry timestamp
   * @param {string} tokenId
   * @param {number} expiryMs
   */
  revoke(tokenId, expiryMs) {
    this.revokedTokens.set(tokenId, expiryMs);
  }

  /**
   * Check if token is revoked
   * @param {string} tokenId
   * @returns {boolean}
   */
  isRevoked(tokenId) {
    const expiryMs = this.revokedTokens.get(tokenId);
    if (!expiryMs) return false;
    if (Date.now() > expiryMs) {
      this.revokedTokens.delete(tokenId);
      return false;
    }
    return true;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, expiryMs] of this.revokedTokens.entries()) {
      if (now > expiryMs) {
        this.revokedTokens.delete(key);
      }
    }
  }

  clear() {
    this.revokedTokens.clear();
  }
}

const revocationStore = new TokenRevocationStore();

/**
 * Hash plaintext password
 * @param {string} password
 * @returns {Promise<string>}
 */
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

/**
 * Compare plaintext password with hash
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
async function comparePassword(password, hash) {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}

/**
 * Generate a signed JWT with unique jti
 * @param {object} payload
 * @returns {string}
 */
function generateToken(payload) {
  const jti = crypto.randomUUID();
  return jwt.sign({ ...payload, jti }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify JWT token and check against revocation store
 * @param {string} token
 * @returns {object} Decoded payload
 */
function verifyToken(token) {
  const decoded = jwt.verify(token, JWT_SECRET);
  if (decoded.jti && revocationStore.isRevoked(decoded.jti)) {
    const err = new Error('Token has been revoked');
    err.name = 'TokenRevokedError';
    throw err;
  }
  return decoded;
}

/**
 * Invalidate token server-side
 * @param {string} token
 */
function revokeToken(token) {
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.jti) {
      const expiryMs = decoded.exp ? decoded.exp * 1000 : Date.now() + 7 * 24 * 3600 * 1000;
      revocationStore.revoke(decoded.jti, expiryMs);
      return true;
    }
  } catch {
    // Ignore decode errors
  }
  return false;
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  revokeToken,
  revocationStore,
};
