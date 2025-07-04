import React, { useState } from 'react';
import { Users, AlertCircle, Check } from 'lucide-react';
import { Contact } from '../types';
import { formatPhoneNumber, generateId } from '../utils/phoneUtils';

interface ContactImportProps {
  onContactsLoaded: (contacts: Contact[]) => void;
  selectedCountryCode: string;
}

const ContactImport: React.FC<ContactImportProps> = ({
  onContactsLoaded,
  selectedCountryCode
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const importContacts = async () => {
    setIsImporting(true);
    setError(null);
    setSuccess(false);

    try {
      // Check if the Contacts API is available
      if (!('contacts' in navigator)) {
        throw new Error('Contact access is not supported in this browser. Please use Chrome on Android or a supported mobile browser.');
      }

      const contacts = await (navigator as any).contacts.select(['name', 'tel'], { multiple: true });
      
      if (!contacts || contacts.length === 0) {
        throw new Error('No contacts selected.');
      }

      const formattedContacts: Contact[] = [];
      const seenNumbers = new Set<string>();

      contacts.forEach((contact: any) => {
        const name = contact.name && contact.name.length > 0 ? contact.name[0] : 'Unknown';
        
        if (contact.tel && contact.tel.length > 0) {
          contact.tel.forEach((tel: string) => {
            try {
              const formattedPhone = formatPhoneNumber(tel, selectedCountryCode);
              
              // Skip duplicates
              if (seenNumbers.has(formattedPhone)) return;
              seenNumbers.add(formattedPhone);
              
              formattedContacts.push({
                id: generateId(),
                name,
                phone: formattedPhone,
                originalPhone: tel,
                status: 'pending'
              });
            } catch (error) {
              console.warn(`Skipping invalid phone number: ${tel}`);
            }
          });
        }
      });

      if (formattedContacts.length === 0) {
        throw new Error('No valid phone numbers found in selected contacts.');
      }

      onContactsLoaded(formattedContacts);
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import contacts');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Import from Phone Contacts</h2>
      
      <div className="text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-600 mb-2">
            Import contacts directly from your phone's contact list
          </p>
          <p className="text-sm text-gray-500">
            Works on Chrome for Android and other supported mobile browsers
          </p>
        </div>

        <button
          onClick={importContacts}
          disabled={isImporting}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isImporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Importing...
            </>
          ) : (
            <>
              <Users className="mr-2 h-5 w-5" />
              Import Contacts
            </>
          )}
        </button>

        {success && (
          <div className="mt-4 p-3 border border-green-300 rounded-md bg-green-50">
            <div className="flex items-center justify-center">
              <Check className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm text-green-800">Contacts imported successfully!</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 border border-red-300 rounded-md bg-red-50">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </div>
        )}

        <div className="mt-6 text-xs text-gray-500">
          <p>• Your privacy is protected - contacts are processed locally</p>
          <p>• Numbers will be formatted for {selectedCountryCode}</p>
          <p>• Duplicates will be automatically removed</p>
        </div>
      </div>
    </div>
  );
};

export default ContactImport;