import { KMSClient, EncryptCommand, DecryptCommand } from '@aws-sdk/client-kms';
import { fromIni } from '@aws-sdk/credential-provider-ini';

class KMSService {
    constructor() {
        this.client = new KMSClient({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: fromIni({ profile: process.env.AWS_PROFILE || 'default' })
        });
        this.keyId = process.env.KMS_KEY_ID;
        
        if (!this.keyId) {
            console.warn('KMS_KEY_ID environment variable is not set. KMS operations will fail.');
        }
    }

    async encrypt(plaintext) {
        if (!this.keyId) {
            throw new Error('KMS_KEY_ID is not configured');
        }

        const params = {
            KeyId: this.keyId,
            Plaintext: Buffer.from(plaintext)
        };

        try {
            const { CiphertextBlob } = await this.client.send(new EncryptCommand(params));
            return CiphertextBlob.toString('base64');
        } catch (error) {
            console.error('Error encrypting with KMS:', error);
            throw error;
        }
    }

    async decrypt(ciphertext) {
        if (!this.keyId) {
            throw new Error('KMS_KEY_ID is not configured');
        }

        const params = {
            CiphertextBlob: Buffer.from(ciphertext, 'base64')
        };

        try {
            const { Plaintext } = await this.client.send(new DecryptCommand(params));
            return Plaintext.toString('utf-8');
        } catch (error) {
            console.error('Error decrypting with KMS:', error);
            throw error;
        }
    }
}

export default new KMSService();
