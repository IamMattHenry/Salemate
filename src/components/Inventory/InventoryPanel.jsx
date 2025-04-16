import React from 'react'
import { Outlet } from "react-router-dom";
import InventoryNav from './InventoryNav';

const InventoryPanel = () => {
  return (
    <section className="grid grid-rows-[10%_1fr] w-auto h-[87.5%] mx-7 p-3">
      <InventoryNav />
      <Outlet />
    </section>
  )
}

export default InventoryPanel