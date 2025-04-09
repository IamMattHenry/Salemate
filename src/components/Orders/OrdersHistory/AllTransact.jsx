import React, { useEffect, useState } from "react";
import DashboardHeader from "../../Dashboard/DashboardHeader";
import OrdersPanel from "../OrdersPanel";

const AllTransact = () => {
    return (
        <>
            <DashboardHeader />
            <OrdersPanel />
        </>
    );
};

export default AllTransact;