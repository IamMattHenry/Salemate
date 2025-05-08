import { useState } from "react";

const useQRPaymentModal = () => {
  const [qrPaymentModal, setQRPaymentModal] = useState(false);

  const showQRPaymentModal = () => {
    setQRPaymentModal(true);
  };

  const hideQRPaymentModal = () => {
    setQRPaymentModal(false);
  };

  return {
    qrPaymentModal,
    showQRPaymentModal,
    hideQRPaymentModal
  };
};

export default useQRPaymentModal;
