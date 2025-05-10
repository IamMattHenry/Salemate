import React from 'react';
import { Outlet } from "react-router-dom";
import AdminNav from './AdminNav';

const AdminPanel = ({ children }) => {
  return (
    <div className="w-full px-7 py-3">
      <AdminNav />
      {children}
    </div>
  );
};

export default AdminPanel;
