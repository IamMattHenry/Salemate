import React from 'react'
import DashboardBrand from './DashboardBrand'
import SideRoutes from './SideRoutes'
import DashboardSideToggle from "./DashboardSideToggle"

const DashboardSideNav = ({ toggleSideNav, isMinimized }) => {
  return (
    <div className={`flex flex-col items-center pt-3 bg-yellowsm/25 overflow-y-hidden}`}>
        <DashboardSideToggle toggleSideNav={toggleSideNav}/>
        <DashboardBrand isMinimized={isMinimized} />
        <SideRoutes isMinimized={isMinimized} />
    </div>
  )
}

export default DashboardSideNav