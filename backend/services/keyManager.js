import { Key } from '../models/keyModel.js';
import crypto from 'crypto';

// In-memory storage for development
const inMemoryKeys = new Map();

class KeyManager {
  constructor() {
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'dev-encryption-key-123';
    this.initialized = false;
    this.currentKey = null;
    console.log('🔑 KeyManager initialized');
  }

  /**
   * Encrypt a key value
   * @param {string} value - The key value to encrypt
   * @returns {string} Encrypted value
   */
  encrypt(value) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.encryptionKey), iv);
      let encrypted = cipher.update(value, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return `${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
      console.error('❌ Encryption error:', error.message);
      throw new Error('Failed to encrypt key');
    }
  }

  /**
   * Decrypt a key value
   * @param {string} value - The encrypted value to decrypt
   * @returns {string} Decrypted value
   */
  decrypt(encryptedValue) {
    if (!encryptedValue) return null;
    
    try {
      const [ivHex, encrypted] = encryptedValue.split(':');
      if (!ivHex || !encrypted) {
        throw new Error('Invalid encrypted value format');
      }
      
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.encryptionKey), iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('❌ Decryption error:', error.message);
      throw new Error('Failed to decrypt key');
    }
  }

  /**
   * Get the current active key
   * @returns {Promise<Object>} The active key data
   */
  async getCurrentKey() {
    try {
      // In development, prioritize in-memory key
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Checking for in-memory key...');
        if (inMemoryKeys.has('gemini-api-key')) {
          const key = inMemoryKeys.get('gemini-api-key');
          console.log('✅ Found in-memory key:', {
            name: key.name,
            type: key.type,
            status: key.status,
            hasValue: !!key.value,
            value: key.value ? '***' : 'undefined'
          });
          return key;
        }
        console.log('ℹ️ No valid in-memory key found');
      }

      // In production or if no valid in-memory key in development
      console.log('🔍 Retrieving active key from database...');
      const key = await Key.getActiveKey('gemini');
      
      if (!key) {
        throw new Error('No active key found in database');
      }
      
      // If we have a value, use it
      if (key.value) {
        // Decrypt the key value if it's encrypted
        if (key.value.includes(':')) {
          try {
            key.value = this.decrypt(key.value);
          } catch (error) {
            console.error('❌ Failed to decrypt key:', error.message);
            throw new Error('Failed to decrypt key: ' + error.message);
          }
        }
        
        // Cache in memory for development
        if (process.env.NODE_ENV === 'development') {
          console.log('💾 Caching key in memory for development');
          inMemoryKeys.set('gemini-api-key', { ...key.toObject() });
        }
        
        console.log('✅ Retrieved active key:', {
          name: key.name,
          type: key.type,
          status: key.status,
          validUntil: key.validUntil,
          hasValue: true
        });
        
        return key;
      }
      
      // If we get here, there's no value
      throw new Error('Active key has no value');
      
    } catch (error) {
      console.error('❌ Error in getCurrentKey:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw new Error('Failed to retrieve active key: ' + error.message);
    }
  }

  /**
   * Set the active key (for development use only)
   * @param {Object} keyData - The key data to set
   */
  async setActiveKey(keyData) {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('setActiveKey is only available in development mode');
    }
    
    try {
      console.log('🔑 Setting in-memory key for development...');
      
      // Create a complete key object with all required fields
      const now = new Date();
      const keyToStore = {
        name: keyData.name || 'gemini-api-key',
        value: keyData.value, // Store the actual value
        type: keyData.type || 'gemini',
        status: keyData.status || 'active',
        validFrom: keyData.validFrom || now,
        validUntil: keyData.validUntil || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
        metadata: {
          ...keyData.metadata,
          createdBy: keyData.metadata?.createdBy || 'setup-script',
          environment: 'development',
          lastUpdated: now.toISOString()
        },
        _id: 'dev-key-' + Date.now(),
        createdAt: now,
        updatedAt: now
      };
      
      // Store in memory
      inMemoryKeys.set('gemini-api-key', keyToStore);
      this.currentKey = keyToStore;
      
      console.log('✅ In-memory key set successfully:', {
        name: keyToStore.name,
        type: keyToStore.type,
        status: keyToStore.status,
        hasValue: !!keyToStore.value,
        validUntil: keyToStore.validUntil
      });
      
      return keyToStore;
      
    } catch (error) {
      console.error('❌ Failed to set in-memory key:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw new Error('Failed to set active key: ' + error.message);
    }
  }
}

// Export a singleton instance
export default new KeyManager();
