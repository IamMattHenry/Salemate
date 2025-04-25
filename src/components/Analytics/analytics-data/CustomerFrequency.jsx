import React from "react";
import AnalyticsDataHeader from "../analytics-common/AnalyticsDataHeader";

const CustomerFrequency = () => {
  const sectionHeader = { label: "Monthly Customer Frequency", date: "test" };

  return (
    <section className="bg-white rounded-2xl shadow-feat w-full mx-auto block my-4 pb-5">
      <AnalyticsDataHeader sectionHeader={sectionHeader} />
      <div className="mt-4 mx-7 w-auto">
        <div className="grid grid-rows-2 grid-cols-[40%_1fr] gap-4">
          <Card className="bg-yellowsm/30 shadow-feat font-latrue">
            <div className="text-xl font-medium text-left mb-2 uppercase">
              Customer Loyalty Metrics
            </div>
            <div className="flex justify-between w-full items-center my-1">
              <div className="text-sm text-left font-latrue">
                <span>New Customers: </span>
              </div>
              <input
                type="text"
                disabled
                className="bg-[#f5f4f4] px-2 border text-sm border-gray-400"
                placeholder="test"
              />
            </div>
            <div className="flex justify-between w-full items-center my-1">
              <div className="text-sm text-left font-latrue">
                <span>Returning Customers: </span>
              </div>
              <input
                type="text"
                disabled
                className="bg-[#f5f4f4] px-2 border text-sm border-gray-400"
                placeholder="test"
              />
            </div>
          </Card>
          <Card className="row-span-2">
            <div className="text-lg font-medium text-left mb-2 uppercase">
              Total Customer {`(Monthly)`}
            </div>
            <div className="grid grid-cols-2 grid-rows-6 gap-2 w-full my-4">
              <MonthInput label="January" />
              <MonthInput label="February" />
              <MonthInput label="March" />
              <MonthInput label="April" />
              <MonthInput label="May" />
              <MonthInput label="June" />

              <MonthInput label="July" />
              <MonthInput label="August" />
              <MonthInput label="September" />
              <MonthInput label="October" />
              <MonthInput label="November" />
              <MonthInput label="December" />
            </div>
          </Card>
          <Card className="bg-yellowsm/30 shadow-feat">
            <div className="text-lg font-medium text-left mb-2 uppercase">
              Customer Segments and average order value
            </div>
            <div className="flex justify-between w-full items-center my-1">
              <div className="text-sm text-left">
                <span>One Time Customer: </span>
              </div>
              <input
                type="text"
                disabled
                className="bg-[#f5f4f4] px-2 border border-gray-400 text-sm"
                placeholder="test"
              />
            </div>
            <div className="flex justify-between w-full items-center my-1">
              <div className="text-sm text-left">
                <span>2-10 Time Customers: </span>
              </div>
              <input
                type="text"
                disabled
                className="bg-[#f5f4f4] px-2 border border-gray-400 text-sm"
                placeholder="test"
              />
            </div>
            <div className="flex justify-between w-full items-center my-1">
              <div className="text-sm text-left">
                <span>11+ Time Customers: </span>
              </div>
              <input
                type="text"
                disabled
                className="bg-[#f5f4f4] px-2 border border-gray-400 text-sm"
                placeholder="test"
              />
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

const Card = ({ children, className = "" }) => (
  <div
    className={`w-full rounded-xl flex flex-col items-start py-3 px-5 font-latrue ${className}`}
  >
    {children}
  </div>
);

const MonthInput = ({ label }) => (
  <div className="flex justify-between w-[90%] items-center">
    <div className="text-[1rem] text-left">
      <span>{label}</span>
    </div>
    <input
      type="text"
      disabled
      className="bg-[#f5f4f4] px-2 border border-gray-400 text-sm"
      placeholder="test"
    />
  </div>
);


export default CustomerFrequency;
