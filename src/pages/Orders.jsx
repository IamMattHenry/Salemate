import React, { useEffect, useState } from "react";
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import OrdersPanel from "../components/Orders/OrdersPanel";

const Orders = () => {
    return (
      <>
        <DashboardHeader />
        <OrdersPanel />
      </>
    );
}

export default Orders