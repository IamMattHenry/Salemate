import React from 'react';
import DashboardHeader from '../../components/Dashboard/DashboardHeader';
import AdminPanel from '../../components/Admin/AdminPanel';

const Admin = ({ children }) => {
  return (
    <>
      <DashboardHeader />
      <AdminPanel>
        {children}
      </AdminPanel>
    </>
  );
};

export default Admin;
