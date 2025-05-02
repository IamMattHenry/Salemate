import React from "react";
import { IoIosSearch } from "react-icons/io";
import NavTabs from "../common/NavTabs";

const OrdersNav = ({ onSearch }) => {
  const orderNavLinks = [
    { path: "/orders/all-transactions", label: "All Transactions" },
    { path: "/orders/completed-transactions", label: "Completed" },
    { path: "/orders/pending-transactions", label: "Pending" },
    { path: "/orders/cancelled-transactions", label: "Cancelled" },
    { path: "/orders/saved-history", label: "Saved History" },
  ];

  const searchProps = {
    placeholder: "Type name or date (mm/dd/yyyy)",
    icon: IoIosSearch,
  };

  return (
    <NavTabs
      links={orderNavLinks}
      searchProps={searchProps}
      onSearch={onSearch}
    />
  );
};

export default OrdersNav;
