import { z } from 'zod';

const semaphoreConfigSchema = z.object({
  apiKey: z.string().min(1),
  senderId: z.string().optional(),
});

export interface SemaphoreConfig {
  apiKey: string;
  senderId?: string;
}

export interface SendSMSOptions {
  phone: string;
  message: string;
}

export interface SendOTPOptions {
  phone: string;
  otp: string;
  appName?: string;
}

export class SemaphoreSMS {
  private apiKey: string;
  private senderId?: string;
  private baseUrl = 'https://api.semaphore.co/api/v4';

  constructor(config: SemaphoreConfig) {
    const validated = semaphoreConfigSchema.parse(config);
    this.apiKey = validated.apiKey;
    this.senderId = validated.senderId;
  }

  /**
   * Send SMS via Semaphore API
   */
  async sendSMS({ phone, message }: SendSMSOptions): Promise<boolean> {
    try {
      console.log(`[SMS] Sending SMS to ${phone}: ${message.substring(0, 50)}...`);
      
      const payload = {
        apikey: this.apiKey,
        number: phone,
        message: message,
      };
      
      if (this.senderId) {
        (payload as any).sendername = this.senderId;
      }

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log(`[SMS] Semaphore Response (${response.status}):`, responseText);

      if (!response.ok) {
        console.error(`[SMS] Semaphore API Error ${response.status}:`, responseText);
        return false;
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('[SMS] Failed to parse response as JSON:', responseText);
        return false;
      }

      const success = result && (result.status === 'success' || result.message === 'success');
      console.log(`[SMS] Send result: ${success ? 'SUCCESS' : 'FAILED'}`, result);
      
      return success;
    } catch (error) {
      console.error('[SMS] Failed to send SMS:', error);
      return false;
    }
  }

  /**
   * Send OTP SMS with formatted message
   */
  async sendOTP({ phone, otp, appName = 'GoTryke' }: SendOTPOptions): Promise<boolean> {
    const message = `Your ${appName} verification code is: ${otp}\n\nThis code will expire in 10 minutes. Do not share this code with anyone.`;
    return this.sendSMS({ phone, message });
  }

  /**
   * Format Philippine phone number to international format
   */
  static formatPhoneNumber(phone: string): string {
    // Remove any non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // If it starts with 63, it's already in international format
    if (cleaned.startsWith('63')) {
      return `+${cleaned}`;
    }
    
    // If it starts with 0, remove it and add +63
    if (cleaned.startsWith('0')) {
      return `+63${cleaned.substring(1)}`;
    }
    
    // Otherwise, assume it's already without country code
    return `+63${cleaned}`;
  }
}

// Create singleton instance
let semaphoreInstance: SemaphoreSMS | null = null;

export function getSemaphoreClient(): SemaphoreSMS {
  if (!semaphoreInstance) {
    const apiKey = process.env.SEMAPHORE_API_KEY;
    if (!apiKey) {
      throw new Error('SEMAPHORE_API_KEY environment variable is not set');
    }
    
    semaphoreInstance = new SemaphoreSMS({
      apiKey,
      senderId: process.env.SEMAPHORE_SENDER_ID,
    });
  }
  
  return semaphoreInstance;
}