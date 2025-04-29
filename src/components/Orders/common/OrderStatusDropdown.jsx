import React, { useEffect, useRef } from "react";
import { IoIosArrowDown } from "react-icons/io";

const OrderStatusDropdown = ({ currentStatus, onStatusChange, isOpen, onToggle }) => {
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (isOpen && dropdownRef.current && containerRef.current) {
      const dropdownRect = dropdownRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - containerRect.bottom;
      const spaceAbove = containerRect.top;
      
      if (spaceBelow < dropdownRect.height && spaceAbove > spaceBelow) {
        dropdownRef.current.style.cssText = `
          bottom: 100%;
          top: auto;
          margin-top: 0;
          margin-bottom: 0.5rem;
        `;
      } else {
        dropdownRef.current.style.cssText = `
          top: 100%;
          bottom: auto;
          margin-top: 0.5rem;
          margin-bottom: 0;
        `;
      }
    }
  }, [isOpen]);

  const statusOptions = [
    { value: 'Preparing', label: 'Preparing', color: 'bg-[#ffcf50]' },
    { value: 'Delivered', label: 'Delivered', color: 'bg-[#0CD742]' },
    { value: 'Cancelled', label: 'Cancelled', color: 'bg-[#ff3434]' }
  ];

  const handleStatusChange = (newStatus) => {
    if (currentStatus === 'Cancelled') return;
    
    // Allow changing from Delivered to Preparing, but not to Cancelled
    if (currentStatus === 'Delivered' && newStatus === 'Cancelled') return;
    
    if (newStatus === 'Cancelled') {
      const confirmed = window.confirm("Are you sure you want to cancel this order? This action cannot be undone.");
      if (!confirmed) return;
    }
    
    onStatusChange(newStatus);
    onToggle(false);
  };

  const availableOptions = statusOptions.filter(option => {
    if (currentStatus === 'Cancelled') return false;
    if (currentStatus === 'Delivered' && option.value === 'Cancelled') return false;
    return true;
  });

  return (
    <div className="relative" ref={containerRef}>
      <button 
        type="button" 
        onClick={() => {
          if (currentStatus !== 'Cancelled') {
            onToggle(!isOpen);
          }
        }} 
        className={`cursor-pointer ml-2 ${
          currentStatus === 'Cancelled' ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <IoIosArrowDown />
      </button>

      {isOpen && availableOptions.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute right-0 py-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 z-[999]"
        >
          {availableOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              className={`
                w-full px-4 py-2 text-left text-sm hover:bg-gray-100
                ${currentStatus === option.value ? 'font-semibold' : ''}
              `}
              disabled={currentStatus === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderStatusDropdown;
