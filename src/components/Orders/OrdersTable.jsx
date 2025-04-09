import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import OrderStatusDropdown from "./OrderStatusDropdown";

const OrdersTable = () => {
  const [orders, setOrders] = useState([]);
  const location = useLocation(); // to access the current route

  // Simulate fetching data based on route
  useEffect(() => {
    const fetchOrders = async () => {
      let fetchedOrders;
      switch (location.pathname) {
        case "/orders/completed-transactions":
          fetchedOrders = await fetchCompletedOrders();
          break;
        case "/orders/pending-transactions":
          fetchedOrders = await fetchPendingOrders();
          break;
        case "/orders/cancelled-transactions":
          fetchedOrders = await fetchCancelledOrders();
          break;
        case "/orders/saved-history":
          fetchedOrders = await fetchSavedHistory();
          break;
        default:
          fetchedOrders = await fetchAllOrders();
      }
      setOrders(fetchedOrders);
    };

    fetchOrders();
  }, [location.pathname]);

  const fetchAllOrders = async () => {
    return [
      { order: "Classic", recipient: "Mary Jane", amount: "P 500", time: "2:30 PM", date: "April 7, 2025", status: "Delivered" },
      { order: "Spicy Katsu", recipient: "Ian Angelo", amount: "P 350", time: "3:00 PM", date: "April 7, 2025", status: "Preparing" },
      { order: "Spicy Katsu", recipient: "Ian Angelo", amount: "P 350", time: "3:00 PM", date: "April 7, 2025", status: "Cancelled" },
    ];
  };

  const fetchCompletedOrders = async () => {
    return [
      { order: "Classic", recipient: "Mary Jane", amount: "P 500", time: "2:30 PM", date: "April 7, 2025", status: "Delivered" },
    ];
  };

  const fetchPendingOrders = async () => {
    return [
      { order: "Spicy Katsu", recipient: "Ian Angelo", amount: "P 350", time: "3:00 PM", date: "April 7, 2025", status: "Preparing" },
    ];
  };

  const fetchCancelledOrders = async () => {
    return [
      { order: "Spicy Katsu", recipient: "Ian Angelo", amount: "P 350", time: "3:00 PM", date: "April 7, 2025", status: "Cancelled" },
    ];
  };

  const fetchSavedHistory = async () => {
    return [
      { order: "Classic", recipient: "Mary Jane", amount: "P 500", time: "2:30 PM", date: "April 7, 2025", status: "Delivered" },
      { order: "Spicy Katsu", recipient: "Ian Angelo", amount: "P 350", time: "3:00 PM", date: "April 7, 2025", status: "Cancelled" },
    ];
  };

  const TableHead = () => (
    <thead className="font-semibold border-b border-b-gray-600/50">
      <tr className="text-left">
        <th className="p-1.5">Order</th>
        <th className="p-1.5">Recipient</th>
        <th className="p-1.5">Amount</th>
        <th className="p-1.5">Time</th>
        <th className="p-1.5">Date</th>
        <th className="p-1.5">Status</th>
      </tr>
    </thead>
  );

  const getStatusClass = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-[#0CD742]";
      case "Preparing":
        return "bg-[#ffcf50]";
      case "Cancelled":
        return "bg-[#ff3434]";
      default:
        return "bg-gray-300 text-black";
    }
  };

  const TableRow = () => (
    <tbody>
      {orders.map((order, index) => (
        <tr key={index} className="bg-white hover:bg-[#ffcf50]/20 transition-colors border-b-[0.1px] border-b-gray-600/20">
          <td className="p-1.5">{order.order}</td>
          <td className="p-1.5">{order.recipient}</td>
          <td className="p-1.5">{order.amount}</td>
          <td className="p-1.5">{order.time}</td>
          <td className="p-1.5">{order.date}</td>
          <td className="p-1.5">
            <span
              className={`w-[8rem] flex items-center justify-between text-sm font-bold px-3 py-2 rounded-xl ${getStatusClass(
                order.status
              )}`}
            >
              {order.status}
              <OrderStatusDropdown />
            </span>
          </td>
        </tr>
      ))}
    </tbody>
  );

  return (
    <section className="bg-white py-2 px-3 rounded-2xl shadow-feat w-full font-lato">
      <table className="w-full table-auto border-collapse">
        <TableHead />
        <TableRow />
      </table>
    </section>
  );
};

export default OrdersTable;
