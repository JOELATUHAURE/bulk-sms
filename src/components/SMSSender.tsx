import React, { useState } from 'react';
import { Send, Settings, AlertCircle, Check } from 'lucide-react';
import { Contact, SMSConfig } from '../types';
import { sendBulkSMS, validateSMSConfig } from '../utils/smsApi';

interface SMSSenderProps {
  contacts: Contact[];
  message: string;
  onContactsUpdated: (contacts: Contact[]) => void;
}

const SMSSender: React.FC<SMSSenderProps> = ({
  contacts,
  message,
  onContactsUpdated
}) => {
  const [isSending, setIsSending] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [smsConfig, setSmsConfig] = useState<SMSConfig>({
    isSandbox: true,
    username: 'sandbox',
    apiKey: 'atsk_59f902fd339b88a12ff204cb3e58972772f66745809522b8c6b30b8fda198f96ae03f9f4',
    senderId: 'AFRICASTKNG'
  });

  const handleConfigChange = (field: keyof SMSConfig, value: string | boolean) => {
    setSmsConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSendSMS = async () => {
    if (!validateSMSConfig(smsConfig)) {
      setError('Please configure SMS settings properly');
      return;
    }

    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    if (contacts.length === 0) {
      setError('Please add contacts first');
      return;
    }

    setIsSending(true);
    setError(null);
    setSuccess(false);

    try {
      const updatedContacts = await sendBulkSMS(message, contacts, smsConfig);
      onContactsUpdated(updatedContacts);
      setSuccess(true);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send SMS');
    } finally {
      setIsSending(false);
    }
  };

  const validContacts = contacts.filter(c => c.phone && c.name);
  const sentContacts = contacts.filter(c => c.status === 'sent');
  const failedContacts = contacts.filter(c => c.status === 'failed');

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Send className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Send SMS</h2>
          </div>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </button>
        </div>

        {showConfig && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium text-gray-800 mb-4">SMS Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mode
                </label>
                <select
                  value={smsConfig.isSandbox ? 'sandbox' : 'live'}
                  onChange={(e) => {
                    const isSandbox = e.target.value === 'sandbox';
                    handleConfigChange('isSandbox', isSandbox);
                    if (isSandbox) {
                      handleConfigChange('username', 'sandbox');
                      handleConfigChange('senderId', 'AFRICASTKNG');
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sandbox">Sandbox (Testing)</option>
                  <option value="live">Live (Production)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={smsConfig.username}
                  onChange={(e) => handleConfigChange('username', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={smsConfig.isSandbox}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={smsConfig.apiKey}
                  onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sender ID
                </label>
                <input
                  type="text"
                  value={smsConfig.senderId}
                  onChange={(e) => handleConfigChange('senderId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={smsConfig.isSandbox}
                />
              </div>
            </div>
            {smsConfig.isSandbox && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Sandbox Mode</p>
                    <p>SMS will be sent to test numbers only. No actual charges will apply.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{validContacts.length}</div>
            <div className="text-sm text-blue-500">Ready to Send</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{sentContacts.length}</div>
            <div className="text-sm text-green-500">Sent</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-lg font-bold text-red-600">{failedContacts.length}</div>
            <div className="text-sm text-red-500">Failed</div>
          </div>
        </div>

        <button
          onClick={handleSendSMS}
          disabled={isSending || validContacts.length === 0 || !message.trim()}
          className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sending SMS...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Send SMS to {validContacts.length} contact{validContacts.length !== 1 ? 's' : ''}
            </>
          )}
        </button>
      </div>

      {success && (
        <div className="p-4 border-t border-gray-200 bg-green-50">
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <p className="font-medium text-green-800">SMS sent successfully!</p>
              <p className="text-sm text-green-600">
                {sentContacts.length} messages sent, {failedContacts.length} failed
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 border-t border-gray-200 bg-red-50">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SMSSender;