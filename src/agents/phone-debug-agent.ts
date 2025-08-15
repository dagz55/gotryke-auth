#!/usr/bin/env node

export class PhoneDebugAgent {
  public async debugPhoneFormatting(): Promise<void> {
    console.log('📞 PHONE DEBUG AGENT - Investigating phone number formatting');
    console.log('='.repeat(65));
    
    // Test the formatPhoneNumber function behavior
    this.testPhoneFormatting();
  }

  private testPhoneFormatting(): void {
    console.log('🔍 Testing phone number formatting...');
    
    const testNumbers = [
      '+639171841111',
      '639171841111', 
      '9171841111',
      '+639171841002',
      '639171841002',
      '9171841002'
    ];

    console.log('Input → Formatted Output:');
    testNumbers.forEach(phone => {
      const formatted = this.formatPhoneNumber(phone);
      console.log(`${phone} → ${formatted}`);
    });

    console.log('\n🚨 POTENTIAL ISSUE:');
    console.log('• Signup might format phone one way');
    console.log('• Signin might format phone differently');
    console.log('• This causes user lookup to fail');
  }

  private formatPhoneNumber(phone: string): string {
    // Copy of the actual function from supabase-auth.ts
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.startsWith('63')) {
      return `+${cleanPhone}`
    }
    if (cleanPhone.startsWith('9')) {
      return `+63${cleanPhone}`
    }
    return `+63${cleanPhone}`
  }
}

// CLI interface
if (require.main === module) {
  const debugAgent = new PhoneDebugAgent();
  debugAgent.debugPhoneFormatting();
}