
// Twilio SMS Integration for immediate SMS testing
// More reliable than Semaphore for quick setup

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber?: string;
  verifyServiceSid?: string;
}

export class TwilioSMS {
  private accountSid: string;
  private authToken: string;
  private fromNumber?: string;
  private verifyServiceSid?: string;

  constructor(config: TwilioConfig) {
    this.accountSid = config.accountSid;
    this.authToken = config.authToken;
    this.fromNumber = config.fromNumber;
    this.verifyServiceSid = config.verifyServiceSid;
  }

  /**
   * Send OTP via Twilio Verify Service
   */
  async sendOTP(to: string, code: string): Promise<boolean> {
    // If verify service is configured, use it
    if (this.verifyServiceSid) {
        try {
            console.log(`[TWILIO VERIFY] Sending OTP via Verify Service to ${to}`);
            const credentials = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
            const response = await fetch(
                `https://verify.twilio.com/v2/Services/${this.verifyServiceSid}/Verifications`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${credentials}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        To: to,
                        Channel: 'sms',
                        Code: code, // Pass the pre-generated code
                    }),
                }
            );

            const responseText = await response.text();
            console.log(`[TWILIO VERIFY] Response (${response.status}):`, responseText);
            
            if (!response.ok) {
              console.error(`[TWILIO VERIFY] API Error ${response.status}:`, responseText);
              return false;
            }

            const result = JSON.parse(responseText);
            const success = result && (result.status === 'pending');
            console.log(`[TWILIO VERIFY] Send result: ${success ? 'SUCCESS' : 'FAILED'}`, result);
            
            return success;
        } catch (error) {
            console.error('[TWILIO VERIFY] Failed to send OTP via Verify Service:', error);
            return false;
        }
    }
    
    // Fallback to regular SMS if verify service is not set
    const message = `Your GoTryke verification code is: ${code}`;
    return this.sendSMS(to, message);
  }

  /**
   * Check OTP with Twilio Verify Service
   */
  async checkOTP(to: string, code: string): Promise<boolean> {
      if (!this.verifyServiceSid) {
        console.error('[TWILIO] Twilio Verify Service SID is not configured for OTP check.');
        return false;
      }

      try {
        console.log(`[TWILIO VERIFY] Checking OTP for ${to}`);
        const credentials = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');

        const response = await fetch(
            `https://verify.twilio.com/v2/Services/${this.verifyServiceSid}/VerificationCheck`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    To: to,
                    Code: code,
                }),
            }
        );
        
        const responseText = await response.text();
        console.log(`[TWILIO VERIFY CHECK] Response (${response.status}):`, responseText);

        if (!response.ok) {
            console.error(`[TWILIO VERIFY CHECK] API Error ${response.status}:`, responseText);
            return false;
        }

        const result = JSON.parse(responseText);
        const success = result && result.status === 'approved';
        console.log(`[TWILIO VERIFY CHECK] Check result: ${success ? 'APPROVED' : 'FAILED'}`, result);

        return success;

      } catch(error) {
        console.error('[TWILIO VERIFY CHECK] Failed to check OTP:', error);
        return false;
      }
  }


  /**
   * Send SMS via Twilio API (fallback method)
   */
  async sendSMS(to: string, message: string): Promise<boolean> {
     if (!this.fromNumber) {
      console.error('[TWILIO] No "From" number configured for direct SMS.');
      return false;
    }

    try {
      console.log(`[TWILIO] Sending SMS to ${to}: ${message.substring(0, 50)}...`);
      
      const credentials = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
      
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: this.fromNumber,
            To: to,
            Body: message,
          }),
        }
      );

      const responseText = await response.text();
      console.log(`[TWILIO] Response (${response.status}):`, responseText);

      if (!response.ok) {
        console.error(`[TWILIO] API Error ${response.status}:`, responseText);
        return false;
      }

      const result = JSON.parse(responseText);
      const success = !!result.sid;
      console.log(`[TWILIO] Send result: ${success ? 'SUCCESS' : 'FAILED'}`, result);
      
      return success;
    } catch (error) {
      console.error('[TWILIO] Failed to send SMS:', error);
      return false;
    }
  }
}

// Create Twilio client instance
export function getTwilioClient(): TwilioSMS | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  
  if (!accountSid || !authToken) {
    console.warn('[TWILIO] Missing credentials - Twilio SMS not configured');
    return null;
  }
  
  return new TwilioSMS({
    accountSid,
    authToken,
    fromNumber,
    verifyServiceSid,
  });
}
