import React from "react";

const CustomersOverview = () => {
  const sampleCustomers = [
    {
      recipient: "Mary Jane",
      orderId: "ORD-001",
      numOrders: 3,
      averageSales: "₱500",
      lastDateOrdered: "April 7, 2025",
      status: "Active",
    },
    {
      recipient: "Ian Angelo",
      orderId: "ORD-002",
      numOrders: 5,
      averageSales: "₱350",
      lastDateOrdered: "April 8, 2025",
      status: "Inactive",
    },
     {
      recipient: "Matt Henry ",
      orderId: "ORD-003",
      numOrders: 4,
      averageSales: "₱450",
      lastDateOrdered: "April 8, 2025",
      status: "active",
    },
     {
      recipient: "Adrian Frivs",
      orderId: "ORD-004",
      numOrders: 7,
      averageSales: "₱890",
      lastDateOrdered: "April 8, 2025",
      status: "active",
    },
     {
      recipient: "Christian Dave",
      orderId: "ORD-005",
      numOrders: 5,
      averageSales: "₱350",
      lastDateOrdered: "April 8, 2025",
      status: "Inactive",
    },
  ];

  return (
    <section className="bg-white rounded-2xl shadow-feat w-full mx-auto block my-4 pb-5 font-lato">
      {/* Header Row */}
      <div className="h-15 w-full rounded-xl text-xl font-semibold grid grid-cols-6 gap-x-4 items-center px-4 pt-7 pb-3">
        <h1>Recipient</h1>
        <h1>Order ID</h1>
        <h1>No. of Orders</h1>
        <h1>Average Sales</h1>
        <h1>Last Date Ordered</h1>
        <h1>Status</h1>
      </div>

      {/* Data Rows */}
      {sampleCustomers.map((cust, idx) => (
        <div
          key={idx}
          className="grid grid-cols-6 gap-x-4 items-center px-4 py-3 hover:bg-amber-100/50 transition-colors border-t border-gray-200 text-sm"
        >
          <p>{cust.recipient}</p>
          <p>{cust.orderId}</p>
          <p>{cust.numOrders}</p>
          <p>{cust.averageSales}</p>
          <p>{cust.lastDateOrdered}</p>
          <p>{cust.status}</p> {/* Just plain text here */}
        </div>
      ))}
    </section>
  );
};

export default CustomersOverview;
