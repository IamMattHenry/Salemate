import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { MdNotificationsActive, MdExpandLess, MdExpandMore } from 'react-icons/md';

const NotificationTester = () => {
  const [selectedType, setSelectedType] = useState('order');
  const { generateTestNotification } = useNotifications();
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleGenerateNotification = async () => {
    setIsGenerating(true);
    setResult('');

    try {
      await generateTestNotification(selectedType);
      setResult(`Successfully generated a ${selectedType.replace('_', ' ')} notification!`);

      // Auto-hide result after 3 seconds
      setTimeout(() => {
        setResult('');
      }, 3000);
    } catch (error) {
      setResult(`Error: ${error.message}`);
      console.error('Error generating notification:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {isExpanded ? (
        <div className="p-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-amber-200 max-w-[200px]">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-medium flex items-center">
              <MdNotificationsActive className="mr-1 text-amber-500" />
              Notification Tester
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <MdExpandMore />
            </button>
          </div>

          <div className="flex flex-col space-y-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs p-1 border border-gray-300 rounded w-full"
            >
              <option value="order">New Order</option>
              <option value="inventory_low">Inventory Low</option>
              <option value="inventory_critical">Inventory Critical</option>
              <option value="customer">Customer Feedback</option>
              <option value="inventory_update">Inventory Update</option>
            </select>

            <button
              onClick={handleGenerateNotification}
              disabled={isGenerating}
              className="text-xs bg-amber-500 hover:bg-amber-600 text-white py-1 px-2 rounded disabled:opacity-50 w-full"
            >
              {isGenerating ? 'Generating...' : 'Generate Notification'}
            </button>

            {result && (
              <div className="text-xs mt-1 p-1 bg-gray-100 rounded text-center">
                {result}
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-md flex items-center justify-center"
          title="Open Notification Tester"
        >
          <MdExpandLess className="text-lg" />
        </button>
      )}
    </div>
  );
};

export default NotificationTester;
