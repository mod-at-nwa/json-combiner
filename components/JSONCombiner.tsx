'use client'
import React, { useState } from 'react';
import { FileText, FolderOpen, Save, Copy, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const JSONCombiner = () => {
  const [combinedData, setCombinedData] = useState({});
  const [selectedPath, setSelectedPath] = useState('');
  const [selectedValue, setSelectedValue] = useState(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          setCombinedData(prev => ({...prev, ...json}));
        } catch (error) {
          console.error('Invalid JSON in file:', file.name);
        }
      };
      reader.readAsText(file);
    });
  };

  const handleSave = () => {
    const jsonString = JSON.stringify(combinedData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'combined_json.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setCombinedData({});
    setSelectedPath('');
  };

  const truncate = (str) => {
    if (typeof str !== 'string') {
      str = JSON.stringify(str);
    }
    return str.length > 30 ? str.substring(0, 27) + '...' : str;
  };


  const renderJSONTree = (obj, path = '') => {
    return (
      <div className="ml-4">
        {Object.entries(obj).map(([key, value]) => {
          const currentPath = path ? `${path}/${key}` : key;
          const isObject = typeof value === 'object' && value !== null;

          return (
            <div key={currentPath} className="my-1">
              <div
                className="flex items-center group hover:bg-gray-100 p-1 rounded"
                onClick={() => setSelectedPath(currentPath)}
              >
                {isObject ? (
                  <>
                    <FolderOpen className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="font-mono">{key}</span>
                  </>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="font-mono">{key}</span>
                    </div>
                    <Dialog>
                      <DialogTrigger>
                        <div
                          className="ml-4 px-2 py-1 rounded bg-gray-50 cursor-pointer group-hover:bg-gray-200"
                          onClick={() => setSelectedValue(value)}
                        >
                          <span className="font-mono text-sm text-gray-600 flex items-center">
                            {truncate(value)}
                            <Copy className="w-4 h-4 ml-2" />
                          </span>
                        </div>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Value for: {key}</DialogTitle>
                        </DialogHeader>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <pre className="whitespace-pre-wrap font-mono">
                            {JSON.stringify(value, null, 2)}
                          </pre>
                        </div>
                        <textarea
                          className="opacity-0 h-0"
                          value={JSON.stringify(value, null, 2)}
                          readOnly
                          id="copyArea"
                        />
                        <button
                          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                          onClick={() => {
                            const copyText = document.getElementById('copyArea');
                            copyText.select();
                            document.execCommand('copy');
                          }}
                        >
                          Copy to Clipboard
                        </button>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
              {isObject && renderJSONTree(value, currentPath)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-none bg-white border-b p-4 fixed top-0 left-0 right-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-4 items-center">
            <div 
              className="flex-1 border-2 border-dashed rounded-lg p-4 text-center"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <p className="text-gray-600">DROP JSON FILES HERE</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                title="Save combined JSON"
              >
                <Save className="w-5 h-5" />
              </button>
              <button
                onClick={handleClear}
                className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                title="Clear all data"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {selectedPath && (
            <Alert className="mt-4">
              <AlertDescription>
                Current Path: <code className="bg-gray-100 px-2 py-1 rounded">{selectedPath}</code>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto pt-32 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-50 p-4 rounded-lg">
            {Object.keys(combinedData).length > 0 ? (
              renderJSONTree(combinedData)
            ) : (
              <p className="text-gray-500 text-center">NO JSON DROPPED YET</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JSONCombiner;
