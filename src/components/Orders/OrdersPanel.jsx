import React, { useState } from 'react';
import OrdersNav from './OrdersNav';
import { Outlet, useOutletContext } from 'react-router-dom';

const OrdersPanel = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  return (
    <>
      <section className='grid grid-rows-[10%_1fr] w-auto h-[87.5%] mx-7 p-3'>
        <OrdersNav onSearch={handleSearch} />
        <Outlet context={{ searchQuery }} />
      </section>
    </>
  );
};

export default OrdersPanel;