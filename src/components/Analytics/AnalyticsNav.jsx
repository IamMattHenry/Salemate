import React from "react";
import NavTabs from "../common/NavTabs";

const AnalyticsNav = () => {
  const analyticsNavLinks = [
    { path: "/analytics/daily-sales", label: "Daily Sales" },
    { path: "/analytics/product-sales", label: "Product Sales" },
    { path: "/analytics/customer-frequency", label: "Customer Frequency" },
    { path: "/analytics/save-history", label: "Saved History" },
  ];

  return (
    <NavTabs
      links={analyticsNavLinks}
    />
  );
};

export default AnalyticsNav;
