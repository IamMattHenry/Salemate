import React from 'react'
import DashboardBrand from './DashboardBrand'
import SideRoutes from './SideRoutes'
import DashboardLogout from "./DashboardLogout"

const DashboardSideNav = () => {
  return (
    <div className='flex flex-col items-center pt-3 bg-yellowsm/10'>
        <DashboardLogout />
        <DashboardBrand />
        <SideRoutes />
    </div>
  )
}

export default DashboardSideNav