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
import { FiAlertTriangle } from "react-icons/fi";

const OrdersTable = () => {
  const { searchQuery } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const { modal, toggleModal } = UseModal();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    type: "timestamp",
    direction: "desc",
  }); // Update the sort state to handle multiple sort options

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

  // Fetch orders with support for both single items and multiple items
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

          // Handle order name formatting based on whether we have items array or just order_name
          let orderName = "";
          if (data.items && data.items.length > 0) {
            // For orders with items array (new format)
            orderName = data.items
              .map((item) => {
                // Make sure to display "Classic" correctly
                if (item.title === "Meal") return "Katsu";
                return item.title; // Return the original title for all other items
              })
              .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
              .join(" / ");
          } else {
            // For legacy data with just order_name
            orderName = data.order_name === "Meal" ? "Katsu" : data.order_name;
          }

          // Check if there are any old preparing orders
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const orderDay = new Date(orderDate);
          orderDay.setHours(0, 0, 0, 0);

          // Calculate days difference
          const diffTime = Math.abs(today - orderDay);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const isOldPreparingOrder = data.order_status === "Preparing" && diffDays > 0;

          return {
            id: doc.id,
            ...data,
            order_name: orderName,
            time: orderDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            date: orderDate.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            }),
            mop: data.mop || "Cash",
            reference_number: data.reference_number || "", // Include reference number for online payments
            quantity: data.items
              ? data.items.reduce(
                  (total, item) => total + (item.quantity || 0),
                  0
                )
              : data.no_order || 0, // Support both new and old formats
            timestamp: data.order_date.seconds,
            order_id_num: parseInt(data.order_id) || 0, // For sorting by order ID
            is_student: data.is_student === true, // Ensure is_student is a boolean
            college: data.college || null, // Include college information
            program_code: data.program_code || null, // Include program code
            program_full: data.program_full || null, // Include full program name
            daysOld: diffDays, // Add days since order was created
            isOldPreparingOrder: isOldPreparingOrder // Flag if order is an old preparing order
          };
        })
        .filter((order) => {
          const orderDate = new Date(order.order_date.seconds * 1000);
          orderDate.setHours(0, 0, 0, 0);

          // Include today's orders and any old "Preparing" orders
          return orderDate.getTime() === today.getTime() || order.isOldPreparingOrder;
        });

      // Sort orders based on current sort preference
      let sortedOrders;
      if (sortConfig.type === "timestamp") {
        // Sort by timestamp (newest first)
        sortedOrders = ordersList.sort((a, b) => b.timestamp - a.timestamp);
      } else if (sortConfig.type === "timestamp_asc") {
        // Sort by timestamp (oldest first)
        sortedOrders = ordersList.sort((a, b) => a.timestamp - b.timestamp);
      } else if (sortConfig.type === "amount_desc") {
        // Sort by amount (highest first)
        sortedOrders = ordersList.sort((a, b) => b.order_total - a.order_total);
      } else if (sortConfig.type === "amount_asc") {
        // Sort by amount (lowest first)
        sortedOrders = ordersList.sort((a, b) => a.order_total - b.order_total);
      } else {
        // Sort by order_id (lowest to highest)
        sortedOrders = ordersList.sort(
          (a, b) => a.order_id_num - b.order_id_num
        );
      }

      setOrders(sortedOrders);
    } catch (error) {
      setError(error.message);
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add sort options and handler
  const sortOptions = [
    { value: "timestamp", label: "Newest First" },
    { value: "timestamp_asc", label: "Oldest First" },
    { value: "amount_desc", label: "Highest Amount" },
    { value: "amount_asc", label: "Lowest Amount" },
    { value: "order_id", label: "Order ID" },
  ];

  const handleSort = (sortType) => {
    let sortedOrders = [...orders];

    switch (sortType) {
      case "timestamp":
        sortedOrders.sort((a, b) => b.timestamp - a.timestamp);
        break;
      case "timestamp_asc":
        sortedOrders.sort((a, b) => a.timestamp - b.timestamp);
        break;
      case "amount_desc":
        sortedOrders.sort((a, b) => b.order_total - a.order_total);
        break;
      case "amount_asc":
        sortedOrders.sort((a, b) => a.order_total - b.order_total);
        break;
      case "order_id":
        sortedOrders.sort((a, b) => a.order_id_num - b.order_id_num);
        break;
      default:
        break;
    }

    setSortConfig({ type: sortType });
    setOrders(sortedOrders);
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
      if (newStatus === "Delivered" && currentOrder.items) {
        // If any items are still preparing, prevent status change
        if (currentOrder.items.some((item) => item.status === "Preparing")) {
          setError(
            "Cannot mark as delivered - some items are still being prepared"
          );
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

  // Format student ID to include a hyphen (e.g., 23-2023)
  const formatStudentId = (id) => {
    if (!id) return "N/A";

    // If the ID already contains a hyphen, return it as is
    if (id.includes("-")) return id;

    // If the ID is 6 digits, format it as XX-XXXX
    if (/^\d{6}$/.test(id)) {
      return `${id.substring(0, 2)}-${id.substring(2)}`;
    }

    // Otherwise return the original ID
    return id;
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
          className="hover:bg-[#ffcf50]/20 hover:shadow-lg transition-colors border-b-[0.5px] border-yellowsm/20 font-medium font-lato"
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

          <td className="px-4 py-4 text-center cursor-pointer">{order.time}</td>

          <td className="px-4 py-4 text-center cursor-pointer">{order.mop}</td>

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

  // Update the main section and table styling
  return (
    <section className="bg-white rounded-2xl h-[calc(100vh-150px)] shadow-lg w-full mx-auto p-6">
      {error && (
        <div className="p-4 mb-6 text-red-500 bg-red-50 rounded-xl border border-red-100 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            />
          </svg>
          {error}
        </div>
      )}

      {/* Notification for old preparing orders */}
      {orders.some(order => order.isOldPreparingOrder) && (
        <div className="p-4 mb-6 text-amber-700 bg-amber-50 rounded-xl border border-amber-200 flex items-center">
          <FiAlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
          <div>
            <p className="font-medium">Attention: You have preparing orders from previous days</p>
            <p className="text-sm mt-1">These orders need to be updated to "Delivered" or "Cancelled" status.
              <a href="/orders/all-preparing-transactions" className="ml-1 text-amber-600 hover:text-amber-800 underline font-medium">
                View all preparing orders
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Modern Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[1.6rem] font-semibold font-lato uppercase">
          Today's Orders
        </h2>
        {/* Modern Sort Dropdown */}
        <div className="relative inline-block">
          <select
            onChange={(e) => handleSort(e.target.value)}
            className="appearance-none bg-white border border-amber-200 text-amber-700 px-4 py-2.5 pr-10 rounded-xl
                      hover:bg-amber-50 transition-all cursor-pointer font-medium shadow-sm
                      focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          >
            {sortOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="text-gray-700 bg-white hover:bg-amber-50"
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg
              className="w-5 h-5 text-amber-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 9l4 4 4-4"
              />
            </svg>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-500 mx-auto"></div>
          <p className="mt-4 text-amber-600 font-medium">Loading orders...</p>
        </div>
      ) : (
        <div className="overflow-auto h-9/12 rounded-xl border border-amber-100/50">
          {/* Fixed header */}
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 sticky top-0 z-10 font-lato">
            <div className="grid grid-cols-6 ">
              <div className="px-6 py-4 font-semibold text-center text-xl">Order</div>
              <div className="px-6 py-4 font-semibold text-center text-xl">
                Recipient
              </div>
              <div className="px-6 py-4 font-semibold text-center text-xl">Amount</div>
              <div className="px-6 py-4 font-semibold text-center text-xl">Time</div>
              <div className="px-6 py-4 font-semibold text-center text-xl">MOP</div>
              <div className="px-6 py-4 font-semibold text-center text-xl">Status</div>
            </div>
          </div>
          <div className="font-latrue">
            {filterOrdersBySearch(filterOrders(orders)).length > 0 ? (
              <div className="divide-y divide-amber-100/50">
                {filterOrdersBySearch(filterOrders(orders)).map((order) => (
                  <div
                    key={order.id}
                    onClick={() => handleRowClick(order)}
                    className={`grid grid-cols-6 hover:bg-amber-50/50 transition-colors cursor-pointer group ${
                      order.isOldPreparingOrder ? 'bg-red-50/30 border-l-4 border-amber-400' : ''
                    }`}
                  >
                    <div className="flex justify-center items-center py-4">
                      <div className="font-medium text-center text-base text-gray-900">
                        {order.order_name}
                      </div>
                    </div>
                    <div className="flex justify-center items-center py-4">
                      <div className="font-medium text-center text-base text-gray-900">
                        {order.recipient}
                      </div>
                    </div>
                    <div className="flex justify-center items-center py-4 text-center">
                      <div className="font-semibold text-center text-base text-amber-700">
                        ₱{order.order_total}
                      </div>
                    </div>
                    <div className="flex justify-center items-center py-4 text-center">
                      <div className="font-medium text-center text-base text-gray-600">
                        {order.time}
                      </div>
                    </div>
                    <div className="flex justify-center items-center py-4">
                      <div className="flex justify-center">
                        <span className="rounded-full text-sm font-medium bg-amber-50 text-amber-700 text-center">
                          {order.mop}
                        </span>
                      </div>
                    </div>
                    <div
                      className="flex justify-center items-center py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-center">
                        <div
                          className={`
                          flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                          ${
                            order.order_status === "Delivered"
                              ? "bg-emerald-100 text-emerald-700"
                              : order.order_status === "Preparing"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                          }
                        `}
                        >
                          <span className="h-2 w-2 rounded-full bg-current"></span>
                          <div className="flex items-center">
                            {order.order_status}
                            {order.isOldPreparingOrder && (
                              <span className="ml-1" title={`${order.daysOld} day(s) old`}>
                                <FiAlertTriangle className="text-amber-600" />
                              </span>
                            )}
                          </div>
                          <OrderStatusDropdown
                            currentStatus={order.order_status}
                            onStatusChange={(newStatus) =>
                              handleStatusChange(order.id, newStatus)
                            }
                            isOpen={activeDropdown === order.id}
                            onToggle={(isOpen) =>
                              setActiveDropdown(isOpen ? order.id : null)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 flex flex-col items-center">
                  <svg
                    className="w-12 h-12 mb-4 text-amber-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  {searchQuery ? (
                    <p>No results found for "{searchQuery}"</p>
                  ) : (
                    <p>
                      No{" "}
                      {location.pathname.includes("completed")
                        ? "completed"
                        : location.pathname.includes("pending")
                        ? "pending"
                        : location.pathname.includes("cancelled")
                        ? "cancelled"
                        : ""}{" "}
                      orders found
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rest of your modal code remains the same */}
      {modal && selectedOrder && (
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-white w-[36rem] rounded-2xl overflow-hidden shadow-2xl border border-gray-100"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Modern Glass Header */}
              <div className="w-full flex items-center justify-between px-8 py-6 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-300 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <IoMdInformationCircle className="text-3xl" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-xl">Order Details</span>
                    <span className="text-sm text-emerald-50">
                      #{selectedOrder.order_id}
                    </span>
                  </div>
                </div>
                <button
                  onClick={toggleModal}
                  className="relative z-10 hover:bg-white/20 p-2 rounded-lg transition-all duration-200 hover:rotate-90"
                >
                  <span className="text-2xl">✕</span>
                </button>
              </div>

              {/* Scrollable Content with Modern Cards */}
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="p-8 space-y-6 bg-gradient-to-b from-emerald-50/50">
                  {/* Order Status & Time */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <span
                        className={`
                        inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium
                        ${
                          selectedOrder.order_status === "Delivered"
                            ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-700/20"
                            : selectedOrder.order_status === "Preparing"
                            ? "bg-amber-100 text-amber-700 ring-1 ring-amber-700/20"
                            : "bg-red-100 text-red-700 ring-1 ring-red-700/20"
                        }
                      `}
                      >
                        <span className="mr-1.5 h-2 w-2 rounded-full bg-current"></span>
                        {selectedOrder.order_status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {selectedOrder.date}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedOrder.time}
                      </p>
                    </div>
                  </div>

                  {/* Modern Customer Info Card */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                      <span className="bg-emerald-100 p-2 rounded-lg mr-3">
                        <svg
                          className="w-5 h-5 text-emerald-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </span>
                      Customer Information
                    </h3>

                    {/* Customer Name with Large Display */}
                    <div className="mb-4">
                      <h4 className="text-xl font-bold text-gray-800">
                        {selectedOrder.recipient}
                      </h4>
                    </div>

                    {/* Customer Type and ID in a Beautiful Card */}
                    <div
                      className={`
                      rounded-xl p-4 border flex items-center gap-4
                      ${
                        selectedOrder.is_student === true
                          ? "bg-blue-50 border-blue-200"
                          : "bg-green-50 border-green-200"
                      }
                    `}
                    >
                      {/* Icon based on customer type */}
                      <div
                        className={`
                        p-3 rounded-full
                        ${
                          selectedOrder.is_student === true
                            ? "bg-blue-100"
                            : "bg-green-100"
                        }
                      `}
                      >
                        {selectedOrder.is_student === true ? (
                          <svg
                            className="w-6 h-6 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 14l9-5-9-5-9 5 9 5z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-6 h-6 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        )}
                      </div>

                      <div className="flex-1">
                        {/* Customer Type */}
                        <div className="font-medium mb-1 text-gray-700">
                          {selectedOrder.is_student === true
                            ? "Student Customer"
                            : "Regular Customer"}
                        </div>

                        {/* Customer ID with Monospace Font for Better Readability */}
                        <div
                          className={`
                          font-mono text-sm font-bold
                          ${
                            selectedOrder.is_student === true
                              ? "text-blue-700"
                              : "text-green-700"
                          }
                        `}
                        >
                          {selectedOrder.is_student === true
                            ? `Student ID: ${
                                formatStudentId(selectedOrder.customer_id) ||
                                "N/A"
                              }`
                            : `Customer ID: ${
                                selectedOrder.customer_id || "N/A"
                              }`}
                        </div>

                        {/* College and Program Information (for students) */}
                        {selectedOrder.is_student === true && selectedOrder.college && (
                          <div className="mt-2 pt-2 border-t border-blue-100">
                            <div className="text-sm text-blue-700 font-medium">
                              {selectedOrder.college}
                            </div>
                            {selectedOrder.program_full && (
                              <div className="text-xs text-blue-600 mt-1">
                                {selectedOrder.program_full}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Modern Order Items Card */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                      <span className="bg-emerald-100 p-2 rounded-lg mr-3">
                        <svg
                          className="w-5 h-5 text-emerald-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                      </span>
                      Order Items
                    </h3>
                    <div className="space-y-3">
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0"
                          >
                            <span className="text-gray-800 font-medium">
                              {item.title === "Meal" ? "Katsu" : item.title}
                            </span>
                            <span className="bg-emerald-50 text-emerald-700 font-medium px-3 py-1 rounded-full">
                              ×{item.quantity}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="flex justify-between items-center py-3">
                          <span className="text-gray-800 font-medium">
                            {selectedOrder.order_name}
                          </span>
                          <span className="bg-emerald-50 text-emerald-700 font-medium px-3 py-1 rounded-full">
                            ×{selectedOrder.no_order || 1}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Modern Payment Details Card */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                      <span className="bg-emerald-100 p-2 rounded-lg mr-3">
                        <svg
                          className="w-5 h-5 text-emerald-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2"
                          />
                        </svg>
                      </span>
                      Payment Details
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-600">Payment Method</span>
                        <span className="font-medium text-gray-900">
                          {selectedOrder.mop}
                        </span>
                      </div>

                      {selectedOrder.mop === "Online" && (
                        <div className="flex justify-between items-center px-4 py-3 bg-blue-50 rounded-xl">
                          <span className="text-blue-600">
                            Reference Number
                          </span>
                          <span className="font-medium text-blue-700">
                            {selectedOrder.reference_number ? (
                              selectedOrder.reference_number
                            ) : (
                              <span className="text-red-500 text-sm italic">
                                Not provided
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center px-4 py-3 bg-emerald-50 rounded-xl">
                        <span className="font-medium text-emerald-800">
                          Total Amount
                        </span>
                        <span className="font-bold text-emerald-700 text-lg">
                          ₱{selectedOrder.order_total}
                        </span>
                      </div>
                    </div>
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
