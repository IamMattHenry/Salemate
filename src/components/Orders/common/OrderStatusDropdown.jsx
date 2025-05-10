import React, { useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { TbCancel } from "react-icons/tb";
import { IoMdWarning } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";

const OrderStatusDropdown = ({
  currentStatus,
  onStatusChange,
  isOpen,
  onToggle,
}) => {
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const { userProfile, isAdmin } = useAuth();

  // Check if user has permission to change order status
  // Marketing department and Admin users can change order status
  const canChangeOrderStatus =
    (userProfile && userProfile.department === "Marketing") ||
    (userProfile && userProfile.department === "Admin") ||
    isAdmin();

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
    { value: "Preparing", label: "Preparing", color: "bg-[#ffcf50]" },
    { value: "Delivered", label: "Delivered", color: "bg-[#0CD742]" },
    { value: "Cancelled", label: "Cancelled", color: "bg-[#ff3434]" },
  ];

  const handleStatusChange = (newStatus) => {
    if (currentStatus === "Cancelled") return;
    if (currentStatus === "Delivered" && newStatus === "Cancelled") return;

    if (newStatus === "Cancelled") {
      setPendingStatus(newStatus);
      setShowCancelConfirm(true);
      return;
    }

    onStatusChange(newStatus);
    onToggle(false);
  };

  const handleConfirmCancel = () => {
    onStatusChange(pendingStatus);
    setShowCancelConfirm(false);
    onToggle(false);
  };

  const availableOptions = statusOptions.filter((option) => {
    if (currentStatus === "Cancelled") return false;
    if (currentStatus === "Delivered" && option.value === "Cancelled")
      return false;
    return true;
  });

  return (
    <div className="relative flex items-center" ref={containerRef}>
      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/25 flex items-center justify-center z-[1000]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white w-[28rem] font-latrue rounded-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="w-full flex items-center justify-between px-4 py-2 bg-[#ff3434] text-white">
                <div className="flex items-center gap-2">
                  <IoMdWarning className="text-2xl" />
                  <span className="font-medium text-lg">Confirm Cancellation</span>
                </div>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="hover:opacity-70 text-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-6 text-center">
                  <p className="text-lg font-semibold mb-2">
                    Are you sure you want to cancel this order?
                  </p>
                  <p className="text-gray-600">
                    This action cannot be undone.
                  </p>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    className="px-6 py-2 bg-gray-200 rounded-lg font-medium hover:bg-gray-300 transition-colors cursor-pointer"
                    onClick={() => setShowCancelConfirm(false)}
                  >
                    No, Keep Order
                  </button>
                  <button
                    className="px-6 py-2 bg-[#ff3434] text-white rounded-lg font-medium hover:bg-[#e62e2e] transition-colors cursor-pointer"
                    onClick={handleConfirmCancel}
                  >
                    Yes, Cancel Order
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dropdown Trigger - Only show for users who can change order status */}
      {canChangeOrderStatus && (
        <button
          type="button"
          onClick={() => {
            // Only allow changing non-cancelled orders
            if (currentStatus !== "Cancelled") {
              onToggle(!isOpen);
            }
          }}
          className={`ml-3 mt-0.5 ${
            currentStatus === "Cancelled"
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer"
          }`}
        >
          {currentStatus !== "Cancelled" ? (
            <IoIosArrowDown />
          ) : (
            <TbCancel />
          )}
        </button>
      )}

      {/* Dropdown Menu - Only show for users who can change order status */}
      {isOpen && availableOptions.length > 0 && canChangeOrderStatus && (
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
                ${currentStatus === option.value ? "font-semibold" : ""}
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