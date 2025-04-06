import React from 'react'
import { BsArrowLeftCircle } from "react-icons/bs";

const DashboardLogout = () => {
  return (
    <div className='w-full flex justify-end'>
      <button type='submit'>
        <BsArrowLeftCircle className='text-gray-500 mx-3 size-5 cursor-pointer hover:text-yellowsm transition-all'/>
      </button>
    </div>
  )
}

export default DashboardLogout