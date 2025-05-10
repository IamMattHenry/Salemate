import React, { useEffect, useState } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import OrderStatusDropdown from "../common/OrderStatusDropdown";
import firebaseApp from "../../../firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getFirestore,
  getDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import UseModal from "../../../hooks/Modal/UseModal";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdInformationCircle } from "react-icons/io";
import { FiAlertTriangle } from "react-icons/fi";

const AllPreparingTransact = () => {
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
    direction: "desc"
  });

  const db = getFirestore(firebaseApp);

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

  // Fetch all preparing orders regardless of date
  const fetchAllPreparingOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      // Create a query to get all orders with "Preparing" status
      const preparingQuery = query(
        collection(db, "order_transaction"),
        where("order_status", "==", "Preparing"),
        orderBy("order_date", "desc")
      );
      
      const querySnapshot = await getDocs(preparingQuery);

      const ordersList = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();
          const orderDate = new Date(data.order_date.seconds * 1000);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const orderDay = new Date(orderDate);
          orderDay.setHours(0, 0, 0, 0);
          
          // Calculate days difference
          const diffTime = Math.abs(today - orderDay);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // Handle order name formatting based on whether we have items array or just order_name
          let orderName = '';
          if (data.items && data.items.length > 0) {
            // For orders with items array (new format)
            orderName = data.items
              .map(item => {
                // Make sure to display "Classic" correctly
                if (item.title === "Meal") return "Katsu";
                return item.title; // Return the original title for all other items
              })
              .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
              .join(' / ');
          } else {
            // For legacy data with just order_name
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
            reference_number: data.reference_number || '', // Include reference number for online payments
            quantity: data.items
              ? data.items.reduce((total, item) => total + (item.quantity || 0), 0)
              : (data.no_order || 0), // Support both new and old formats
            timestamp: data.order_date.seconds,
            order_id_num: parseInt(data.order_id) || 0, // For sorting by order ID
            is_student: data.is_student === true, // Ensure is_student is a boolean
            college: data.college || null, // Include college information
            program_code: data.program_code || null, // Include program code
            program_full: data.program_full || null, // Include full program name
            daysOld: diffDays, // Add days since order was created
            isOld: diffDays > 0 // Flag if order is from a previous day
          };
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
      } else if (sortConfig.type === "days_old") {
        // Sort by age (oldest first)
        sortedOrders = ordersList.sort((a, b) => b.daysOld - a.daysOld);
      } else {
        // Sort by order_id (lowest to highest)
        sortedOrders = ordersList.sort((a, b) => a.order_id_num - b.order_id_num);
      }

      setOrders(sortedOrders);
    } catch (error) {
      setError(error.message);
      console.error("Error fetching preparing orders:", error);
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
    { value: "days_old", label: "Oldest Orders First" },
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
      case "days_old":
        sortedOrders.sort((a, b) => b.daysOld - a.daysOld);
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
    fetchAllPreparingOrders();
  }, []);

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
        if (currentOrder.items.some(item => item.status === "Preparing")) {
          setError("Cannot mark as delivered - some items are still being prepared");
          return;
        }
      }

      // If all checks pass, update the order status
      await updateDoc(orderRef, {
        order_status: newStatus,
        updated_at: new Date(),
      });

      await fetchAllPreparingOrders();
    } catch (error) {
      setError("Failed to update order status. Please try again.");
      console.error("Error updating order status:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format student ID to include a hyphen (e.g., 23-2023)
  const formatStudentId = (id) => {
    if (!id) return 'N/A';

    // If the ID already contains a hyphen, return it as is
    if (id.includes('-')) return id;

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

  return (
    <section className="bg-white rounded-2xl h-[calc(100vh-150px)] shadow-lg w-full mx-auto p-6">
      {error && (
        <div className="p-4 mb-6 text-red-500 bg-red-50 rounded-xl border border-red-100 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
          </svg>
          {error}
        </div>
      )}

      {/* Modern Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
          All Preparing Orders
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
        <div className="overflow-auto h-9/12 rounded-xl border border-amber-100">
          {/* Fixed header */}
          <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 sticky top-0 z-10">
            <div className="grid grid-cols-7 text-amber-800">
              <div className="px-6 py-4 font-semibold text-left">Order</div>
              <div className="px-6 py-4 font-semibold text-left">Recipient</div>
              <div className="px-6 py-4 font-semibold text-center">Amount</div>
              <div className="px-6 py-4 font-semibold text-center">Date</div>
              <div className="px-6 py-4 font-semibold text-center">Time</div>
              <div className="px-6 py-4 font-semibold text-center">MOP</div>
              <div className="px-6 py-4 font-semibold text-center">Status</div>
            </div>
          </div>
          {/* Scrollable content */}
          <div className="overflow-y-scroll">
            {filterOrdersBySearch(orders).length > 0 ? (
              <div className="divide-y divide-amber-100">
                {filterOrdersBySearch(orders).map((order) => (
                  <div
                    key={order.id}
                    onClick={() => handleRowClick(order)}
                    className={`grid grid-cols-7 hover:bg-amber-50/50 transition-colors cursor-pointer group ${
                      order.isOld ? 'bg-red-50/30' : ''
                    }`}
                  >
                    <div className="px-6 py-4">
                      <div className="font-medium text-gray-900">{order.order_name}</div>
                    </div>
                    <div className="px-6 py-4">
                      <div className="font-medium text-gray-900">{order.recipient}</div>
                    </div>
                    <div className="px-6 py-4 text-center">
                      <div className="font-semibold text-amber-700">₱{order.order_total}</div>
                    </div>
                    <div className="px-6 py-4 text-center text-gray-600">
                      <div className="flex items-center justify-center">
                        {order.isOld && (
                          <FiAlertTriangle className="text-red-500 mr-2" title={`${order.daysOld} day(s) old`} />
                        )}
                        {order.date}
                      </div>
                    </div>
                    <div className="px-6 py-4 text-center text-gray-600">{order.time}</div>
                    <div className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-50 text-amber-700">
                          {order.mop}
                        </span>
                      </div>
                    </div>
                    <div className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center">
                        <div className={`
                          flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                          ${order.order_status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-700'
                            : order.order_status === 'Preparing'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'}
                        `}>
                          <span className="h-2 w-2 rounded-full bg-current"></span>
                          {order.order_status}
                          <OrderStatusDropdown
                            currentStatus={order.order_status}
                            onStatusChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                            isOpen={activeDropdown === order.id}
                            onToggle={(isOpen) => setActiveDropdown(isOpen ? order.id : null)}
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
                  <svg className="w-12 h-12 mb-4 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {searchQuery ? (
                    <p>No results found for "{searchQuery}"</p>
                  ) : (
                    <p>No preparing orders found</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      <AnimatePresence>
        {modal && selectedOrder && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleModal}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Order Details Header */}
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white">
                <h3 className="text-xl font-bold">Order Details</h3>
                <p className="text-amber-100">Order #{selectedOrder.order_id}</p>
              </div>

              {/* Order Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {/* Customer Info */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Customer Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <p className="text-gray-700"><span className="font-medium">Name:</span> {selectedOrder.recipient}</p>
                    <p className="text-gray-700">
                      <span className="font-medium">Type:</span> {selectedOrder.is_student ? 'Student' : 'Non-Student'}
                    </p>
                    {selectedOrder.is_student && (
                      <>
                        <p className="text-gray-700">
                          <span className="font-medium">Student ID:</span> {formatStudentId(selectedOrder.customer_id)}
                        </p>
                        {selectedOrder.college && (
                          <p className="text-gray-700">
                            <span className="font-medium">College:</span> {selectedOrder.college}
                          </p>
                        )}
                        {selectedOrder.program_full && (
                          <p className="text-gray-700">
                            <span className="font-medium">Program:</span> {selectedOrder.program_full}
                          </p>
                        )}
                      </>
                    )}
                    {!selectedOrder.is_student && (
                      <p className="text-gray-700">
                        <span className="font-medium">Customer ID:</span> {selectedOrder.customer_id}
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Details */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Order Details</h4>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="grid grid-cols-2 gap-4">
                      <p className="text-gray-700"><span className="font-medium">Date:</span> {selectedOrder.date}</p>
                      <p className="text-gray-700"><span className="font-medium">Time:</span> {selectedOrder.time}</p>
                      <p className="text-gray-700"><span className="font-medium">Status:</span> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                          selectedOrder.order_status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          selectedOrder.order_status === 'Preparing' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {selectedOrder.order_status}
                        </span>
                      </p>
                      <p className="text-gray-700"><span className="font-medium">Payment:</span> {selectedOrder.mop}</p>
                    </div>
                    
                    {selectedOrder.mop === "Online" && selectedOrder.reference_number && (
                      <p className="text-gray-700 mt-2">
                        <span className="font-medium">Reference #:</span> {selectedOrder.reference_number}
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Order Items</h4>
                  <div className="bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedOrder.items ? (
                          selectedOrder.items.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">{item.title === "Meal" ? "Katsu" : item.title}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 text-center">{item.quantity}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 text-right">₱{item.price}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 text-right">₱{item.price * item.quantity}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="px-4 py-3 text-sm text-gray-900">{selectedOrder.order_name === "Meal" ? "Katsu" : selectedOrder.order_name}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-center">{selectedOrder.no_order}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">₱{(selectedOrder.order_total / selectedOrder.no_order).toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">₱{selectedOrder.order_total}</td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan="3" className="px-4 py-3 text-sm font-medium text-gray-900 text-right">Total Amount:</td>
                          <td className="px-4 py-3 text-sm font-bold text-amber-600 text-right">₱{selectedOrder.order_total}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-200 p-4 flex justify-end">
                <button
                  onClick={toggleModal}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default AllPreparingTransact;
