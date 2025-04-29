import React, { useEffect, useState } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import OrderStatusDropdown from "./common/OrderStatusDropdown";
import firebaseApp from "../../firebaseConfig";
import { collection, getDocs, doc, updateDoc, getFirestore } from "firebase/firestore";
import UseModal from "../../hooks/Modal/UseModal";
import { MdCancel } from "react-icons/md";
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
    if (path.includes('completed')) {
      return orders.filter(order => order.order_status === "Delivered");
    } else if (path.includes('pending')) {
      return orders.filter(order => order.order_status === "Preparing");
    } else if (path.includes('cancelled')) {
      return orders.filter(order => order.order_status === "Cancelled");
    }
    return orders;
  };

  const filterOrdersBySearch = (orders) => {
    if (!searchQuery) return orders;
    
    const query = searchQuery.toLowerCase().trim();
    
    return orders.filter(order => {
      const orderName = order.order_name?.toLowerCase() || '';
      const recipientName = order.recipient?.toLowerCase() || '';
      const orderTotal = order.order_total?.toString() || '';

      // Format the date in multiple ways for searching
      const orderDate = new Date(order.order_date.seconds * 1000);
      
      // Format 1: mm/dd/yy
      const shortDate = orderDate.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit'
      });
      
      // Format 2: mm/dd/yyyy
      const fullDate = orderDate.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
      
      // Format 3: Month DD, YYYY
      const longDate = orderDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
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

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db, "order_transaction"));
      const ordersList = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          time: new Date(data.order_date.seconds * 1000).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          }),
          date: new Date(data.order_date.seconds * 1000).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          }),
          // Store timestamp for sorting
          timestamp: data.order_date.seconds
        };
      });

      // Sort by timestamp in descending order (newest first)
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
    <thead className="font-semibold border-b-[0.1px] border-b-yellowsm/40">
      <tr className="text-center">
        <th className="px-4 py-2">Order</th>
        <th className="px-4 py-2">Recipient</th>
        <th className="px-4 py-2">Amount</th>
        <th className="px-4 py-2">Time</th>
        <th className="px-4 py-2">Date</th>
        <th className="px-4 py-2">Status</th>
      </tr>
    </thead>
  );

  const getStatusClass = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-[#0CD742] text-black";
      case "Preparing":
        return "bg-[#ffcf50] text-black";
      case "Cancelled":
        return "bg-[#ff3434] text-black";
      default:
        return "bg-gray-300 text-black";
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (newStatus === "Cancelled") {
      const confirmed = window.confirm("Are you sure you want to cancel this order? This action cannot be undone.");
      if (!confirmed) return;
    }

    setLoading(true);
    try {
      const orderRef = doc(db, "order_transaction", orderId);
      await updateDoc(orderRef, {
        order_status: newStatus,
        updated_at: new Date()
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
          className="hover:bg-[#ffcf50]/20 transition-colors border-t border-gray-100 cursor-pointer"
          onClick={() => handleRowClick(order)}
        >
          <td className="px-4 py-4 text-center">{order.order_name}</td>
          <td className="px-4 py-4 text-center">{order.recipient}</td>
          <td className="px-4 py-4 text-center">₱ {order.order_total}</td>
          <td className="px-4 py-4 text-center">{order.time}</td>
          <td className="px-4 py-4 text-center">{order.date}</td>
          <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center">
              <div
                className={`px-6 py-2 rounded-full flex items-center justify-between min-w-[120px] ${getStatusClass(
                  order.order_status
                )}`}
              >
                <span className="font-medium">{order.order_status}</span>
                {order.order_status !== "Cancelled" && (
                  <OrderStatusDropdown 
                    currentStatus={order.order_status}
                    onStatusChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                    isOpen={activeDropdown === order.id}
                    onToggle={(isOpen) => {
                      setActiveDropdown(isOpen ? order.id : null);
                    }}
                  />
                )}
              </div>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  );

  return (
    <section className="bg-white rounded-2xl shadow-feat w-full mx-auto my-4">
      {error && (
        <div className="p-4 text-red-500">{error}</div>
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
                      : `No ${location.pathname.includes('completed') ? 'completed' : 
                          location.pathname.includes('pending') ? 'pending' : 
                          location.pathname.includes('cancelled') ? 'cancelled' : ''} orders found`
                    }
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
      )}

      {/* Updated Modal Design */}
      {modal && selectedOrder && (
        <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
          <div className="bg-white w-[25rem] rounded-2xl font-lato overflow-hidden">
            {/* Header */}
            <div className="w-full flex items-center justify-between px-4 py-2 bg-[#0CD742]">
              <div className="flex items-center gap-1">
                <span className="font-medium text-sm">Order Info</span>
                <IoMdInformationCircle className="text-lg" />
              </div>
              <button 
                onClick={toggleModal}
                className="hover:opacity-70 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-3">
              {/* Order Header */}
              <div className="mb-4 space-y-0.5">
                <div className="flex justify-between text-sm">
                  <div className="space-y-0.5">
                    <div>Order ID: {selectedOrder.order_id}</div>
                    <div>Status: {selectedOrder.order_status}</div>
                    <div>Recipient Name: {selectedOrder.recipient}</div>
                  </div>
                  <div className="text-right text-xs">
                    <div>Date: {selectedOrder.date}</div>
                    <div>Time: {selectedOrder.time}</div>
                  </div>
                </div>
              </div>

              {/* Order Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Orders Column */}
                <div className="bg-[#FFF8E6] rounded-lg p-2">
                  <h4 className="text-sm font-medium mb-1">Order(s)</h4>
                  <div className="text-sm">
                    {selectedOrder.order_name}
                  </div>
                </div>

                {/* Quantity Column */}
                <div className="bg-[#FFF8E6] rounded-lg p-2">
                  <h4 className="text-sm font-medium mb-1">Quantity</h4>
                  <div className="text-sm">x{selectedOrder.no_order}</div>
                </div>

                {/* Amount Column */}
                <div className="bg-[#FFF8E6] rounded-lg p-2">
                  <h4 className="text-sm font-medium mb-1">Amount</h4>
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span>{selectedOrder.order_total}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Column */}
                <div className="bg-[#FFF8E6] rounded-lg p-2">
                  <h4 className="text-sm font-medium mb-1">Mode of Payment</h4>
                  <div className="text-sm">{selectedOrder.mop}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default OrdersTable;
