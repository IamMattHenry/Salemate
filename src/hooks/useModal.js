import { useState } from 'react';

export const useModal = () => {
  const [modal, setModal] = useState(false);

  const toggleModal = () => {
    setModal(!modal);
  };

  return {
    modal,
    toggleModal
  };
};