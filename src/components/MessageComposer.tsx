import React, { useState, useEffect } from 'react';
import { MessageSquare, Info } from 'lucide-react';
import { calculateSMSPages } from '../utils/phoneUtils';

interface MessageComposerProps {
  message: string;
  onMessageChange: (message: string) => void;
  recipientCount: number;
}

const MessageComposer: React.FC<MessageComposerProps> = ({
  message,
  onMessageChange,
  recipientCount
}) => {
  const [smsPages, setSmsPages] = useState(1);
  const [estimatedCost, setEstimatedCost] = useState(0);

  useEffect(() => {
    const pages = calculateSMSPages(message);
    setSmsPages(pages);
    // Estimated cost per SMS in sandbox (approximately $0.05 per SMS)
    setEstimatedCost(pages * recipientCount * 0.05);
  }, [message, recipientCount]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center mb-4">
        <MessageSquare className="h-5 w-5 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-800">Compose Message</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            SMS Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Type your message here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={6}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{message.length}</div>
            <div className="text-xs text-gray-500">Characters</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{smsPages}</div>
            <div className="text-xs text-gray-500">SMS Pages</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{recipientCount}</div>
            <div className="text-xs text-gray-500">Recipients</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">${estimatedCost.toFixed(2)}</div>
            <div className="text-xs text-gray-500">Est. Cost</div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">SMS Guidelines:</p>
              <ul className="space-y-1 text-xs">
                <li>• Single SMS: up to 160 characters</li>
                <li>• Long SMS: split into 153-character parts</li>
                <li>• Include your name/organization for better delivery</li>
                <li>• Avoid excessive punctuation or ALL CAPS</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageComposer;