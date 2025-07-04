import React, { useState } from 'react';
import { MessageSquare, Smartphone, Upload, Send } from 'lucide-react';
import { Contact } from './types';
import FileUpload from './components/FileUpload';
import ContactImport from './components/ContactImport';
import MessageComposer from './components/MessageComposer';
import ContactList from './components/ContactList';
import SMSSender from './components/SMSSender';

function App() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [message, setMessage] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('+256');
  const [activeTab, setActiveTab] = useState<'upload' | 'import'>('upload');

  const handleContactsLoaded = (newContacts: Contact[]) => {
    // Merge with existing contacts, avoiding duplicates
    const existingNumbers = new Set(contacts.map(c => c.phone));
    const uniqueNewContacts = newContacts.filter(c => !existingNumbers.has(c.phone));
    setContacts(prev => [...prev, ...uniqueNewContacts]);
  };

  const handleClearContacts = () => {
    setContacts([]);
  };

  const handleContactsUpdated = (updatedContacts: Contact[]) => {
    setContacts(updatedContacts);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">BulkSMS Pro</h1>
                <p className="text-sm text-gray-500">Send bulk SMS with ease</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <Smartphone className="h-4 w-4" />
                <span>Mobile Friendly</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload and Import */}
          <div className="lg:col-span-1 space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    activeTab === 'upload'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Upload className="h-4 w-4 mx-auto mb-1" />
                  Upload File
                </button>
                <button
                  onClick={() => setActiveTab('import')}
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    activeTab === 'import'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Smartphone className="h-4 w-4 mx-auto mb-1" />
                  Import Contacts
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'upload' ? (
              <FileUpload
                onContactsLoaded={handleContactsLoaded}
                selectedCountryCode={selectedCountryCode}
                onCountryCodeChange={setSelectedCountryCode}
              />
            ) : (
              <ContactImport
                onContactsLoaded={handleContactsLoaded}
                selectedCountryCode={selectedCountryCode}
              />
            )}
          </div>

          {/* Right Column - Message and Sending */}
          <div className="lg:col-span-2 space-y-6">
            {/* Message Composer */}
            <MessageComposer
              message={message}
              onMessageChange={setMessage}
              recipientCount={contacts.length}
            />

            {/* SMS Sender */}
            <SMSSender
              contacts={contacts}
              message={message}
              onContactsUpdated={handleContactsUpdated}
            />
          </div>
        </div>

        {/* Contact List - Full Width */}
        <div className="mt-8">
          <ContactList
            contacts={contacts}
            onClearContacts={handleClearContacts}
            message={message}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-600">
              <p>Powered by Africa's Talking SMS API</p>
            </div>
            <div className="text-sm text-gray-500 mt-4 md:mt-0">
              <p>© 2025 BulkSMS Pro. Built with React & TypeScript.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;