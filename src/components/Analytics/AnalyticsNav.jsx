import React from "react";
import { IoIosSearch } from "react-icons/io";
import { LiaFileDownloadSolid } from "react-icons/lia";
import NavTabs from "../common/NavTabs";

const AnalyticsNav = () => {
  const analyticsNavLinks = [
    { path: "/analytics/daily-sales", label: "Daily Sales" },
    { path: "/analytics/product-sales", label: "Product Sales" },
    { path: "/analytics/customer-frequency", label: "Customer Frequency" },
    { path: "/analytics/save-history", label: "Save History" },
  ];

  const searchProps = {
    placeholder: "Type name or date (mm/dd/yy)",
    icon: IoIosSearch
  };

  const actionButton = {
      icon: LiaFileDownloadSolid,
    };

  return (
    <NavTabs 
      links={analyticsNavLinks}
      searchProps={searchProps}
    />
  );
};

export default AnalyticsNav;