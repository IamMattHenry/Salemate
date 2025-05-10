import React from "react";
import NavTabs from "../common/NavTabs";
import { IoIosSearch } from "react-icons/io";

const AdminNav = ({ onSearch }) => {
  const adminNavLinks = [
    {
      path: "/admin/user-accounts",
      label: "User Accounts",
    }
  ];

  const searchProps = {
    placeholder: "Search by email, department, user ID, or date",
    icon: IoIosSearch,
  };

  return (
    <NavTabs
      links={adminNavLinks}
      searchProps={searchProps}
      onSearch={onSearch}
      className="justify-start w-full"
    />
  );
};

export default AdminNav;
