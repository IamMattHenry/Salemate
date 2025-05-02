import { useState } from "react";

const useConfirmOrderModal = () => {
  const [confirmOrderModal, setConfirmOrderModal] = useState(false);
  
  const toggleConfirmOrderModal = () => {
    setConfirmOrderModal(prevState => !prevState);
  };
  
  const showConfirmOrderModal = () => {
    setConfirmOrderModal(true);
  };

  return { confirmOrderModal, showConfirmOrderModal, toggleConfirmOrderModal };
};

export default useConfirmOrderModal;