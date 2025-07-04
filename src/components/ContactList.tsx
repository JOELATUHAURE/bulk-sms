import React from 'react';
import { Users, Phone, CheckCircle, XCircle, Clock, Download, Trash2 } from 'lucide-react';
import { Contact } from '../types';
import { exportToCSV } from '../utils/fileUtils';

interface ContactListProps {
  contacts: Contact[];
  onClearContacts: () => void;
  message: string;
}

const ContactList: React.FC<ContactListProps> = ({
  contacts,
  onClearContacts,
  message
}) => {
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExport = () => {
    exportToCSV(contacts, message);
  };

  if (contacts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="text-center py-8">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No contacts loaded yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Upload a file or import from your phone to get started
          </p>
        </div>
      </div>
    );
  }

  const sentCount = contacts.filter(c => c.status === 'sent').length;
  const failedCount = contacts.filter(c => c.status === 'failed').length;
  const pendingCount = contacts.filter(c => c.status === 'pending').length;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">
              Contacts ({contacts.length})
            </h2>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleExport}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
            <button
              onClick={onClearContacts}
              className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-600">{pendingCount}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{sentCount}</div>
            <div className="text-sm text-green-500">Sent</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-lg font-bold text-red-600">{failedCount}</div>
            <div className="text-sm text-red-500">Failed</div>
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <div className="divide-y divide-gray-200">
          {contacts.map((contact) => (
            <div key={contact.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{contact.name}</div>
                    <div className="text-sm text-gray-500">{contact.phone}</div>
                    {contact.originalPhone !== contact.phone && (
                      <div className="text-xs text-gray-400">
                        Original: {contact.originalPhone}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(contact.status)}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(contact.status)}`}>
                    {contact.status || 'pending'}
                  </span>
                </div>
              </div>
              {contact.error && (
                <div className="mt-2 text-xs text-red-600 pl-8">
                  Error: {contact.error}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactList;