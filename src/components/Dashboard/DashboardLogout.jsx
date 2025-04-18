import React from 'react'
import { CiPower } from "react-icons/ci";

const DashboardLogout = ({isMinimized}) => {
  return (
    <button type="button" className="flex items-center justify-center p-2 space-x-2 cursor-pointer mb-10">
        <CiPower className='text-2xl text-black' />
        {!isMinimized && <span className='font-lato text-[1.05rem] font-semibold'>Logout</span>}
    </button>
  )
}

export default DashboardLogout