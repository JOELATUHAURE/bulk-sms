export interface Contact {
  id: string;
  name: string;
  phone: string;
  originalPhone: string;
  status?: 'pending' | 'sent' | 'failed';
  error?: string;
}

export interface SMSMessage {
  message: string;
  recipients: Contact[];
  timestamp: Date;
  totalSent: number;
  totalFailed: number;
}

export interface APIResponse {
  SMSMessageData: {
    Message: string;
    Recipients: Array<{
      statusCode: number;
      number: string;
      status: string;
      cost: string;
      messageId: string;
    }>;
  };
}

export interface CountryCode {
  code: string;
  name: string;
  flag: string;
}

export interface SMSConfig {
  isSandbox: boolean;
  username: string;
  apiKey: string;
  senderId: string;
}