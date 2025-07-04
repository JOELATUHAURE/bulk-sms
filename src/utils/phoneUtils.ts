import { CountryCode } from '../types';

export const COUNTRY_CODES: CountryCode[] = [
  { code: '+256', name: 'Uganda', flag: '🇺🇬' },
  { code: '+254', name: 'Kenya', flag: '🇰🇪' },
  { code: '+255', name: 'Tanzania', flag: '🇹🇿' },
  { code: '+250', name: 'Rwanda', flag: '🇷🇼' },
  { code: '+234', name: 'Nigeria', flag: '🇳🇬' },
  { code: '+27', name: 'South Africa', flag: '🇿🇦' },
  { code: '+233', name: 'Ghana', flag: '🇬🇭' },
];

export const formatPhoneNumber = (phone: string, defaultCountryCode = '+256'): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // If already has country code, return as is
  if (phone.startsWith('+')) {
    return phone.replace(/\D/g, '').replace(/^(\d+)/, '+$1');
  }
  
  // Handle Uganda specific formatting
  if (defaultCountryCode === '+256') {
    // If starts with 07, convert to +2567
    if (cleaned.startsWith('07')) {
      return `+256${cleaned.substring(1)}`;
    }
    
    // If starts with 256, add +
    if (cleaned.startsWith('256')) {
      return `+${cleaned}`;
    }
    
    // If 9 digits, add +256
    if (cleaned.length === 9) {
      return `+256${cleaned}`;
    }
    
    // If 10 digits starting with 0, replace 0 with +256
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
      return `+256${cleaned.substring(1)}`;
    }
  }
  
  // For other countries, if number doesn't start with country code, add it
  const countryDigits = defaultCountryCode.replace('+', '');
  if (!cleaned.startsWith(countryDigits)) {
    return `${defaultCountryCode}${cleaned}`;
  }
  
  return `+${cleaned}`;
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+\d{10,15}$/;
  return phoneRegex.test(phone);
};

export const calculateSMSPages = (message: string): number => {
  const length = message.length;
  if (length <= 160) return 1;
  if (length <= 306) return 2;
  return Math.ceil(length / 153); // Concatenated SMS uses 153 chars per part
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};