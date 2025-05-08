import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdCancel } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";

const QRPaymentModal = ({
  isVisible,
  onClose,
  onComplete,
  orderNumber,
  totalAmount: initialTotalAmount,
  paymentMethod = "Online"
}) => {
  const [totalAmount, setTotalAmount] = useState(initialTotalAmount);
  const [currentOrderNumber, setCurrentOrderNumber] = useState(orderNumber);
  const [referenceNumber, setReferenceNumber] = useState("");

  // Listen for updates to the QR Payment Modal props
  useEffect(() => {
    const handleUpdateQRPaymentModal = (event) => {
      const { orderNumber, totalAmount } = event.detail;
      if (totalAmount !== undefined) {
        setTotalAmount(totalAmount);
      }
      if (orderNumber !== undefined) {
        setCurrentOrderNumber(orderNumber);
      }
    };

    document.addEventListener('updateQRPaymentModal', handleUpdateQRPaymentModal);

    return () => {
      document.removeEventListener('updateQRPaymentModal', handleUpdateQRPaymentModal);
    };
  }, []);

  // Update state when props change
  useEffect(() => {
    setTotalAmount(initialTotalAmount);
    setCurrentOrderNumber(orderNumber);
  }, [initialTotalAmount, orderNumber]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="bg-white w-[90%] max-w-[400px] rounded-2xl shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
        >
          {/* Header */}
          <div className="px-6 py-5 bg-emerald-500 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-400/30 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="font-semibold">Scan to Pay</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-emerald-400/30 rounded-lg transition-colors"
              >
                <MdCancel size={20} />
              </button>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="p-6 text-center">
            <div className="mb-4">
              <p className="text-gray-600 mb-1">Order #{currentOrderNumber}</p>
              <p className="text-xl font-bold text-emerald-600">₱{totalAmount.toFixed(2)}</p>
            </div>

            <div className="flex justify-center mb-4">
              <motion.div
                className="bg-white p-3 border-2 border-gray-200 rounded-lg shadow-md"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <img
                  src="https://1.bp.blogspot.com/-dHN4KiD3dsU/XRxU5JRV7DI/AAAAAAAAAz4/u1ynpCMIuKwZMA642dHEoXFVKuHQbJvwgCEwYBhgL/s1600/qr-code.png"
                  alt="Payment QR Code"
                  className="w-56 h-56 object-contain"
                />
              </motion.div>
            </div>

            <p className="text-gray-600 text-sm mb-4">
              Scan this QR code with your mobile payment app to complete your purchase
            </p>

            {/* Reference Number Input */}
            <div className="mb-6">
              <label htmlFor="referenceNumber" className="block text-sm font-medium text-gray-700 text-left mb-1">
                Last 6 digits of reference number:
              </label>
              <input
                type="text"
                id="referenceNumber"
                value={referenceNumber}
                onChange={(e) => {
                  // Only allow numbers and limit to 6 digits
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  if (value.length <= 6) {
                    setReferenceNumber(value);
                  }
                }}
                placeholder="Enter last 6 digits"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                maxLength="6"
                required
              />
            </div>

            <div className="flex justify-center">
              <motion.button
                onClick={() => onComplete(referenceNumber)}
                disabled={referenceNumber.length < 6}
                className={`px-6 py-3 rounded-xl font-medium
                         flex items-center justify-center gap-2
                         ${referenceNumber.length < 6
                           ? 'bg-gray-400 cursor-not-allowed'
                           : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/30'}`}
                whileHover={referenceNumber.length >= 6 ? { scale: 1.03 } : {}}
                whileTap={referenceNumber.length >= 6 ? { scale: 0.98 } : {}}
              >
                <FaCheckCircle className="w-5 h-5" />
                Payment Complete
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QRPaymentModal;
