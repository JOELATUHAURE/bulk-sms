import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { Contact } from '../types';
import { parseExcelFile, parseCSVFile } from '../utils/fileUtils';
import { COUNTRY_CODES } from '../utils/phoneUtils';

interface FileUploadProps {
  onContactsLoaded: (contacts: Contact[]) => void;
  selectedCountryCode: string;
  onCountryCodeChange: (code: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onContactsLoaded,
  selectedCountryCode,
  onCountryCodeChange
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setError(null);
    setIsProcessing(true);
    setUploadedFile(file);

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      let contacts: Contact[];

      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        contacts = await parseExcelFile(file, selectedCountryCode);
      } else if (fileExtension === 'csv') {
        contacts = await parseCSVFile(file, selectedCountryCode);
      } else {
        throw new Error('Unsupported file format. Please upload Excel (.xlsx) or CSV (.csv) files.');
      }

      if (contacts.length === 0) {
        throw new Error('No valid contacts found in the file.');
      }

      onContactsLoaded(contacts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
      setUploadedFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setError(null);
    onContactsLoaded([]);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Upload Contacts</h2>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Country:</label>
          <select
            value={selectedCountryCode}
            onChange={(e) => onCountryCodeChange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {COUNTRY_CODES.map(country => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.name} ({country.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {!uploadedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-600 mb-2">
            Drag & drop your contact file here
          </p>
          <p className="text-sm text-gray-500 mb-4">
            or click to browse for Excel (.xlsx) or CSV (.csv) files
          </p>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <FileText className="mr-2 h-4 w-4" />
            Choose File
          </label>
          
          <div className="mt-4 text-xs text-gray-500">
            <p>Expected format: Two columns with headers "Name" and "Phone"</p>
            <p>Phone numbers will be automatically formatted for {selectedCountryCode}</p>
          </div>
        </div>
      ) : (
        <div className="border border-green-300 rounded-lg p-4 bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">
                {uploadedFile.name}
              </span>
            </div>
            <button
              onClick={removeFile}
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="mt-4 flex items-center text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-sm">Processing file...</span>
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
    </div>
  );
};

export default FileUpload;