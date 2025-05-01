import React from "react";
import NavTabs from "../common/NavTabs";
import { IoIosSearch } from "react-icons/io";

const CustomersNav = ({ onSearch }) => {
  const customersNavLink = [
    {
      path: "/customer/overview",
      label: "Overview",
    },
  ];

  const searchProps = {
    placeholder: "Search by name, ID (23-2023), or date",
    icon: IoIosSearch,
  };

  return (
    <NavTabs
      links={customersNavLink}
      searchProps={searchProps}
      onSearch={onSearch}
      className="justify-start w-full" 
    />
  );
};

export default CustomersNav;
