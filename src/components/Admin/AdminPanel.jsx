import React from 'react';
import { Outlet } from "react-router-dom";
import AdminNav from './AdminNav';
import UserAccounts from './admin-data/UserAccounts';

const AdminPanel = () => {
  return (
    <div className="w-full px-7 py-3">
      <UserAccounts />
    </div>
  );
};

export default AdminPanel;
