import React from 'react'
import { Outlet } from "react-router-dom";
import CustomersNav from './CustomersNav';

const CustomersPanel = () => {
  return (
    <section className="grid grid-rows-[10%_1fr] w-auto h-[87.5%] mx-7 p-3">
      <CustomersNav />
      <Outlet />
    </section>
  )
}

export default CustomersPanel