import React from 'react'
import AnalyticsDataHeader from '../analytics-common/AnalyticsDataHeader';

const ProductSales = () => {
  const sectionHeader = { label: "Test", date: "test" };

    return (
        <section className='bg-white rounded-2xl shadow-feat w-full mx-auto block my-4'>
          <AnalyticsDataHeader sectionHeader={sectionHeader} />
          Product
        </section>
      );
}

export default ProductSales