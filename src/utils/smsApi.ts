import { Contact, APIResponse, SMSConfig } from '../types';

// CORS proxy for testing - NOT for production use
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const SMS_API_ENDPOINT = 'https://api.africastalking.com/version1/messaging';

export const sendBulkSMS = async (
  message: string,
  contacts: Contact[],
  config: SMSConfig
): Promise<Contact[]> => {
  const updatedContacts = [...contacts];
  
  try {
    // For sandbox mode, we'll simulate the API call since CORS prevents direct calls
    if (config.isSandbox) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate random success/failure for demonstration
      updatedContacts.forEach((contact, index) => {
        // Simulate 80% success rate
        const isSuccess = Math.random() > 0.2;
        contact.status = isSuccess ? 'sent' : 'failed';
        if (!isSuccess) {
          contact.error = 'Simulated failure for demo';
        }
      });
      
      return updatedContacts;
    }
    
    // For live mode, attempt the actual API call with CORS proxy
    const proxyUrl = `${CORS_PROXY}${SMS_API_ENDPOINT}`;
    const recipients = contacts.map(c => c.phone).join(',');
    
    const formData = new FormData();
    formData.append('username', config.username);
    formData.append('to', recipients);
    formData.append('message', message);
    formData.append('from', config.senderId);
    
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'apiKey': config.apiKey,
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: APIResponse = await response.json();
    
    // Process response and update contact statuses
    if (data.SMSMessageData && data.SMSMessageData.Recipients) {
      data.SMSMessageData.Recipients.forEach(recipient => {
        const contactIndex = updatedContacts.findIndex(c => c.phone === recipient.number);
        if (contactIndex !== -1) {
          updatedContacts[contactIndex].status = recipient.statusCode === 101 ? 'sent' : 'failed';
          if (recipient.statusCode !== 101) {
            updatedContacts[contactIndex].error = recipient.status;
          }
        }
      });
    }
    
    return updatedContacts;
  } catch (error) {
    console.error('SMS API Error:', error);
    
    // Mark all contacts as failed
    updatedContacts.forEach(contact => {
      contact.status = 'failed';
      contact.error = error instanceof Error ? error.message : 'Network error - API call blocked by CORS policy';
    });
    
    return updatedContacts;
  }
};

export const validateSMSConfig = (config: SMSConfig): boolean => {
  return !!(config.username && config.apiKey && config.senderId);
};
