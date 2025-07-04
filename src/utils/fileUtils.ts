import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Contact } from '../types';
import { formatPhoneNumber, generateId } from './phoneUtils';

export const parseExcelFile = (file: File, countryCode: string): Promise<Contact[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        const contacts = processRawData(jsonData as string[][], countryCode);
        resolve(contacts);
      } catch (error) {
        reject(new Error('Failed to parse Excel file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
};

export const parseCSVFile = (file: File, countryCode: string): Promise<Contact[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        try {
          const contacts = processRawData(results.data as string[][], countryCode);
          resolve(contacts);
        } catch (error) {
          reject(new Error('Failed to parse CSV file'));
        }
      },
      error: (error) => reject(new Error(`CSV parsing error: ${error.message}`))
    });
  });
};

const processRawData = (data: string[][], countryCode: string): Contact[] => {
  if (data.length < 2) {
    throw new Error('File must contain at least a header row and one data row');
  }
  
  const headers = data[0].map(h => h.toString().toLowerCase().trim());
  const nameIndex = findColumnIndex(headers, ['name', 'full name', 'contact name']);
  const phoneIndex = findColumnIndex(headers, ['phone', 'phone number', 'number', 'tel', 'telephone', 'mobile']);
  
  if (nameIndex === -1 || phoneIndex === -1) {
    throw new Error('Could not find required columns. Please ensure your file has "Name" and "Phone" columns.');
  }
  
  const contacts: Contact[] = [];
  const seenNumbers = new Set<string>();
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    
    const name = row[nameIndex]?.toString().trim();
    const originalPhone = row[phoneIndex]?.toString().trim();
    
    if (!name || !originalPhone) continue;
    
    try {
      const formattedPhone = formatPhoneNumber(originalPhone, countryCode);
      
      // Skip duplicates
      if (seenNumbers.has(formattedPhone)) continue;
      seenNumbers.add(formattedPhone);
      
      contacts.push({
        id: generateId(),
        name,
        phone: formattedPhone,
        originalPhone,
        status: 'pending'
      });
    } catch (error) {
      console.warn(`Skipping invalid phone number: ${originalPhone}`);
    }
  }
  
  return contacts;
};

const findColumnIndex = (headers: string[], possibleNames: string[]): number => {
  for (const name of possibleNames) {
    const index = headers.findIndex(h => h.includes(name));
    if (index !== -1) return index;
  }
  return -1;
};

export const exportToCSV = (contacts: Contact[], message: string): void => {
  const csvContent = [
    ['Name', 'Phone', 'Original Phone', 'Status', 'Error'],
    ...contacts.map(c => [c.name, c.phone, c.originalPhone, c.status || 'pending', c.error || ''])
  ];
  
  const csv = Papa.unparse(csvContent);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sms-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};