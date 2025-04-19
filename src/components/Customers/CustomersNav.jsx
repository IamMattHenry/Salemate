import React from "react";
import NavTabs from "../common/NavTabs";
import { IoIosSearch } from "react-icons/io";
const CustomersNav = () => {
  const customersNavLink = [
    {
      path: "/customer/overview",
      label: "Overview",
    },
  ];

  const searchProps = {
    placeholder: "Type name or date (mm/dd/yy)",
    icon: IoIosSearch,
  };

  return (
    <NavTabs
      links={customersNavLink}
      searchProps={searchProps}
      className="justify-start w-full" 
    />
  );
};

export default CustomersNav;
