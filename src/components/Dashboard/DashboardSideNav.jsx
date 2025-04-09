import React from 'react'
import DashboardBrand from './DashboardBrand'
import SideRoutes from './SideRoutes'
import DashboardSideToggle from "./DashboardSideToggle"

const DashboardSideNav = ({ toggleSideNav, isMinimized }) => {
  return (
    <div className={`flex flex-col items-center pt-3 bg-gradient-to-b from-whitesm from-15% via-yellowf via-60% to-yellowsm to-90% overflow-y-hidden}`}>
        <DashboardSideToggle toggleSideNav={toggleSideNav}/>
        <DashboardBrand isMinimized={isMinimized} />
        <SideRoutes isMinimized={isMinimized} />
    </div>
  )
}

export default DashboardSideNav