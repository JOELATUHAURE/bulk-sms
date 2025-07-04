import { Contact, APIResponse, SMSConfig } from '../types';

const SMS_API_ENDPOINT = 'https://api.africastalking.com/version1/messaging';

export const sendBulkSMS = async (
  message: string,
  contacts: Contact[],
  config: SMSConfig
): Promise<Contact[]> => {
  const updatedContacts = [...contacts];
  
  try {
    // Prepare recipients string
    const recipients = contacts.map(c => c.phone).join(',');
    
    // Prepare form data
    const formData = new FormData();
    formData.append('username', config.username);
    formData.append('to', recipients);
    formData.append('message', message);
    formData.append('from', config.senderId);
    
    const response = await fetch(SMS_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'apiKey': config.apiKey,
        'Accept': 'application/json',
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
      contact.error = error instanceof Error ? error.message : 'Unknown error';
    });
    
    return updatedContacts;
  }
};

export const validateSMSConfig = (config: SMSConfig): boolean => {
  return !!(config.username && config.apiKey && config.senderId);
};