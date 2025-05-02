import React from 'react';
import { Outlet } from "react-router-dom";
import { useModal } from "../../hooks/useModal";

const CustomersPanel = () => {
  const { modal, toggleModal } = useModal();

  return (
    <div className="w-full px-7 py-3">
      
      <Outlet />
    </div>
  );
};

export default CustomersPanel;