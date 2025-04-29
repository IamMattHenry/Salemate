import { useState } from 'react';

const UseModal = () => {
  const [modal, setModal] = useState(false);

  const toggleModal = () => {
    setModal(!modal);
  };

  return { modal, toggleModal };
};

export default UseModal;
