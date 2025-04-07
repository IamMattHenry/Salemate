import React from 'react'

const OrdersTable = () => {
  const orders = [
    {
      order: "Classic",
      recipient: "Mary Jane",
      amount: "P 500",
      time: "2:30 PM",
      date: "April 7, 2025",
      status: "Delivered"
    },
    {
      order: "Spicy Katsu",
      recipient: "Ian Angelo",
      amount: "P 350",
      time: "3:00 PM",
      date: "April 7, 2025",
      status: "Pending"
    },
  ];

  const TableHead = () => (
    <thead>
      <tr>
        <th>Order</th>
        <th>Recipient</th>
        <th>Amount</th>
        <th>Time</th>
        <th>Date</th>
        <th>Status</th>
      </tr>
    </thead>
  );

  const TableRow = () => (
    <tbody>
      {orders.map((order, index) => (
        <tr key={index}>
          <td>{order.order}</td>
          <td>{order.recipient}</td>
          <td>{order.amount}</td>
          <td>{order.time}</td>
          <td>{order.date}</td>
          <td>{order.status}</td>
        </tr>
      ))}
    </tbody>
  );

  return (
    <section className="border">
      <table>
        <TableHead />
        <TableRow />
      </table>
    </section>
  )
}

export default OrdersTable
