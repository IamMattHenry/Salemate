import React from 'react'
import OrdersNav from './OrdersNav'
import OrdersTable from './OrdersTable'

const OrdersPanel = () => {
  return (
    <>
        <section className='grid grid-rows-[10%_1fr] w-auto h-[87.5%] mx-7 p-3'>
            <OrdersNav />
            <OrdersTable />
        </section>
    </>
  )
}

export default OrdersPanel