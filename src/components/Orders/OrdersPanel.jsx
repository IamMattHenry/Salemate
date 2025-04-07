import React from 'react'
import OrdersNav from './OrdersNav'
import OrdersTable from './OrdersTable'

const OrdersPanel = () => {
  return (
    <>
        <section className='grid grid-rows-[10%_1fr] w-[95%] h-[80%] border m-3'>
            <OrdersNav />
            <OrdersTable />
        </section>
    </>
  )
}

export default OrdersPanel