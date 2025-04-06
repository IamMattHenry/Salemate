import { useState } from "react";

const nameModal = () => {
  const [inputNameModal, setNameModal] = useState(false);

  const showNameModal = () => {
    setNameModal(!inputNameModal);
  };

  return {inputNameModal, showNameModal};
};

export default nameModal;
