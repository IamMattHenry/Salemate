import React from "react";
import AnalyticsDataHeader from "../analytics-common/AnalyticsDataHeader";

const ProductSales = () => {
  const sectionHeader = { label: "Monthly Statistics", date: "test" };

  return (
    <section className="bg-white rounded-2xl shadow-feat w-full mx-auto block my-4">
      <AnalyticsDataHeader sectionHeader={sectionHeader} />
      <div className="mt-4 mx-7 w-auto">
        <div className="grid grid-rows-2 grid-flow-col gap-4">
          <Card label="test " subLabel="test" amount="₱test" />
          <Card label="test " subLabel="test" amount="₱test" />
          <Card label="test " subLabel="test" amount="₱test" />
          <Card label="test " subLabel="test" amount="₱test" />
          <CardOverallProf label="test " subLabel="test" amount="₱test" />
        </div>
      </div>
    </section>
  );
};

const Card = ({ label, subLabel, amount }) => (
  <div className="bg-yellowsm/30 h-40 w-full rounded-sm shadow-feat flex flex-row items-center justify-between font-lato px-5">
    <div>
      <div>
        <div className="text-lg font-medium text-left">{label}</div>
        <div className="text-sm text-gray-600 mb-5 -mt-2 text-left">
          {subLabel}
        </div>
      </div>
      <div className="text-xl font-medium">{amount}</div>
    </div>
  </div>
);

const CardOverallProf = ({ label, subLabel, amount }) => (
  <div className="bg-yellowsm/30 w-full rounded-sm shadow-feat flex flex-row items-center justify-between font-lato px-5 row-span-2">
    <div>
      <div>
        <div className="text-lg font-medium text-left">{label}</div>
        <div className="text-sm text-gray-600 mb-5 -mt-2 text-left">
          {subLabel}
        </div>
      </div>
      <div className="text-xl font-medium">{amount}</div>
    </div>
  </div>
);

export default ProductSales;
