import { useState } from "react";

const successModal = () => {
  const [okayModal, setSuccessModal] = useState(false);

  const showSuccessModal = () => {
    setSuccessModal(!okayModal);
  };

  return {okayModal, showSuccessModal};
};

export default successModal;
