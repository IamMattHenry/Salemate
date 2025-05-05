import React, { useEffect, useState } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import OrderStatusDropdown from "./common/OrderStatusDropdown";
import firebaseApp from "../../firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getFirestore,
  getDoc,
} from "firebase/firestore";
import UseModal from "../../hooks/Modal/UseModal";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdInformationCircle } from "react-icons/io";

const OrdersTable = () => {
  const { searchQuery } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const { modal, toggleModal } = UseModal();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const db = getFirestore(firebaseApp);

  const filterOrders = (orders) => {
    const path = location.pathname.toLowerCase();
    if (path.includes("completed")) {
      return orders.filter((order) => order.order_status === "Delivered");
    } else if (path.includes("pending")) {
      return orders.filter((order) => order.order_status === "Preparing");
    } else if (path.includes("cancelled")) {
      return orders.filter((order) => order.order_status === "Cancelled");
    }
    return orders;
  };

  const filterOrdersBySearch = (orders) => {
    if (!searchQuery) return orders;

    const query = searchQuery.toLowerCase().trim();

    return orders.filter((order) => {
      const orderName = order.order_name?.toLowerCase() || "";
      const recipientName = order.recipient?.toLowerCase() || "";
      const orderTotal = order.order_total?.toString() || "";

      // Format the date in multiple ways for searching
      const orderDate = new Date(order.order_date.seconds * 1000);

      // Format 1: mm/dd/yy
      const shortDate = orderDate.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      });

      // Format 2: mm/dd/yyyy
      const fullDate = orderDate.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });

      // Format 3: Month DD, YYYY
      const longDate = orderDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      return (
        orderName.includes(query) ||
        recipientName.includes(query) ||
        orderTotal.includes(query) ||
        shortDate.toLowerCase().includes(query) ||
        fullDate.toLowerCase().includes(query) ||
        longDate.toLowerCase().includes(query)
      );
    });
  };

  // Modify the fetchOrders function to handle multiple items
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db, "order_transaction"));
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const ordersList = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();
          const orderDate = new Date(data.order_date.seconds * 1000);
          
          // Format order names from items array
          let orderName = '';
          if (data.items && data.items.length > 0) {
            orderName = data.items
              .map(item => item.title === "Meal" ? "Katsu" : item.title)
              .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
              .join(' / ');
          } else {
            // Fallback for legacy data
            orderName = data.order_name === "Meal" ? "Katsu" : data.order_name;
          }

          return {
            id: doc.id,
            ...data,
            order_name: orderName,
            time: orderDate.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }),
            date: orderDate.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            }),
            mop: data.mop || 'Cash',
            quantity: data.items
              ? data.items.reduce((total, item) => total + (item.quantity || 0), 0)
              : 0,
            timestamp: data.order_date.seconds,
          };
        })
        .filter(order => {
          const orderDate = new Date(order.order_date.seconds * 1000);
          orderDate.setHours(0, 0, 0, 0);
          return orderDate.getTime() === today.getTime();
        });

      const sortedOrders = ordersList.sort((a, b) => b.timestamp - a.timestamp);
      setOrders(sortedOrders);
    } catch (error) {
      setError(error.message);
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const TableHead = () => (
    <thead className="text-[1.25rem] border-b-[0.5px] border-b-yellowsm/20 font-lato">
      <tr className="text-center">
        <th className="px-4 py-4 font-semibold">Order</th>
        <th className="px-4 py-4 font-semibold">Recipient</th>
        <th className="px-4 py-4 font-semibold">Amount</th>
        <th className="px-4 py-4 font-semibold">Time</th>
        <th className="px-4 py-4 font-semibold">MOP</th>
        <th className="px-4 py-4 font-semibold">Status</th>
      </tr>
    </thead>
  );

  const getStatusClass = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-[#0CD742] text-black font-bold";
      case "Preparing":
        return "bg-[#ffcf50] text-black font-bold";
      case "Cancelled":
        return "bg-[#ff3434] text-black font-bold text-center";
      default:
        return "bg-gray-300 text-black";
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setLoading(true);
    try {
      // Get the current order
      const orderRef = doc(db, "order_transaction", orderId);
      const orderSnapshot = await getDoc(orderRef);
      const currentOrder = orderSnapshot.data();
  
      // Check if all items in the order are ready before marking as Delivered
      if (newStatus === "Delivered") {
        // If any items are still preparing, prevent status change
        if (currentOrder.items?.some(item => item.status === "Preparing")) {
          setError("Cannot mark as delivered - some items are still being prepared");
          return;
        }
      }
  
      // If all checks pass, update the order status
      await updateDoc(orderRef, {
        order_status: newStatus,
        updated_at: new Date(),
      });
      
      await fetchOrders();
    } catch (error) {
      setError("Failed to update order status. Please try again.");
      console.error("Error updating order status:", error);
    } finally {
      setLoading(false);
    }
  };
  

  const handleRowClick = (order) => {
    setSelectedOrder(order);
    toggleModal();
  };

  const TableRow = () => (
    <tbody>
      {filterOrdersBySearch(filterOrders(orders)).map((order) => (
        <tr
          key={order.id}
          className="hover:bg-[#ffcf50]/20 hover:shadow-lg transition-colors border-b-[0.5px] border-yellowsm/20 font-medium font-latrue"
          onClick={() => handleRowClick(order)}
        >
          <td className="px-4 py-4 text-center cursor-pointer">
            {order.order_name}
          </td>

          <td className="px-4 py-4 text-center cursor-pointer">
            {order.recipient}
          </td>

          <td className="px-4 py-4 text-center cursor-pointer">
            ₱ {order.order_total}
          </td>

          <td className="px-4 py-4 text-center cursor-pointer">
            {order.time}
          </td>

          <td className="px-4 py-4 text-center cursor-pointer">
            {order.mop}
          </td>

          <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center">
              <div
                className={`py-2 px-6 rounded-full flex items-center justify-between min-w-1/5 border-[0.5px] ${getStatusClass(
                  order.order_status
                )}`}
              >
                <span className="font-ebold font-lato text-center">
                  {order.order_status}
                </span>
                <OrderStatusDropdown
                  currentStatus={order.order_status}
                  onStatusChange={(newStatus) =>
                    handleStatusChange(order.id, newStatus)
                  }
                  isOpen={activeDropdown === order.id}
                  onToggle={(isOpen) => {
                    setActiveDropdown(isOpen ? order.id : null);
                  }}
                />
              </div>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  );

  return (
    <section className="bg-white rounded-2xl shadow-feat w-full mx-auto">
      {error && (
        <div className="p-4 text-red-500 bg-red-50 m-4 rounded-lg">
          {error}
        </div>
      )}
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <TableHead />
            {filterOrdersBySearch(filterOrders(orders)).length > 0 ? (
              <TableRow />
            ) : (
              <tbody>
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    {searchQuery
                      ? `No results found for "${searchQuery}"`
                      : `No ${
                          location.pathname.includes("completed")
                            ? "completed"
                            : location.pathname.includes("pending")
                            ? "pending"
                            : location.pathname.includes("cancelled")
                            ? "cancelled"
                            : ""
                        } orders found`}
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
      )}

      {modal && selectedOrder && (
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 bg-black/25 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white w-[28rem] rounded-2xl font-latrue overflow-hidden"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="w-full flex items-center justify-between px-4 py-2 bg-[#0CD742] text-white">
                <div className="flex items-center gap-2">
                  <IoMdInformationCircle className="text-2xl" />
                    <span className="font-medium text-lg">Order Info</span>
                  </div>
                <button
                  onClick={toggleModal}
                  className="hover:opacity-70 text-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="p-3">
                {/* Order Header */}
                <div className="mb-4 space-y-0.5">
                  <div className="flex justify-between text-sm">
                    <div>
                      <div className="font-bold font-lato text-xl -mb-2">Order ID: {selectedOrder.order_id}</div>
                      <div className="-mb-1 font-semibold">Status: {selectedOrder.order_status}</div>
                      <div className="font-semibold">Recipient Name: {selectedOrder.recipient}</div>
                    </div>
                    <div className="text-right font-semibold text-sm">
                      <div className="-mb-1">Date: {new Date(selectedOrder.order_date.seconds * 1000).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}</div>
                      <div>Time: {selectedOrder.time}</div>
                    </div>
                  </div>
                </div>

                {/* Order Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Orders Column with Individual Quantities */}
                  <div className="bg-[#FFF8E6] rounded-lg p-2 shadow-sm col-span-2">
                    <h4 className="text-sm font-bold mb-2">Order Details</h4>
                    <div className="space-y-1">
                      {selectedOrder.items && selectedOrder.items.map((item, index) => (
                        <div key={index} className="text-sm flex justify-between">
                          <span>{item.title === "Meal" ? "Katsu" : item.title}:</span>
                          <span>x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Amount Column */}
                  <div className="bg-[#FFF8E6] rounded-lg p-2 shadow-sm">
                    <h4 className="text-sm font-bold mb-1">Amount</h4>
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span>₱{selectedOrder.order_total}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Column */}
                  <div className="bg-[#FFF8E6] rounded-lg p-2 shadow-sm">
                    <h4 className="text-sm font-bold mb-1">
                      Mode of Payment
                    </h4>
                    <div className="text-sm">{selectedOrder.mop}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </section>
  );
};

export default OrdersTable;