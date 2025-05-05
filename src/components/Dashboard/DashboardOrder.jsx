import React, { useState, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";
import { MdCancel, MdDelete } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
import { IoPencil } from "react-icons/io5";
import { FiAlertCircle } from "react-icons/fi";
import useNameModal from "../../hooks/Modal/EnterNameModal";
import useConfirmOrderModal from "../../hooks/Modal/ConfirmOrderModal";
import useSuccessModal from "../../hooks/Modal/SuccessModal";
import { AnimatePresence, motion } from "framer-motion";
import { collection, addDoc, serverTimestamp, updateDoc, getFirestore, query, where, getDocs, orderBy } from "firebase/firestore";
import firebaseApp from "../../firebaseConfig";

const DashboardOrder = ({ product, orderList, setOrderList }) => {
  const [orderNumber, setOrderNumber] = useState(1);
  const [quantities, setQuantities] = useState([]);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [nameError, setNameError] = useState("");
  const [idError, setIdError] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  // Initialize Firestore
  const db = getFirestore(firebaseApp);

  // Import custom hooks
  const { inputNameModal, showNameModal, toggleModal } = useNameModal();
  const { confirmOrderModal, showConfirmOrderModal, toggleConfirmOrderModal } = useConfirmOrderModal();
  const { okayModal, showSuccessModal } = useSuccessModal();

  // Get current date and time
  const dateToday = new Date();
  const timeToday = dateToday.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const formattedDate = dateToday.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // For backward compatibility with old implementation
  const [quantity, setQuantity] = useState(1);

  // Initialize quantities based on the orderList length and quantity
  useEffect(() => {
    if (orderList && orderList.length > 0) {
      // Use product quantities if they exist, otherwise default to 1
      setQuantities(orderList.map(item => item.quantity || 1));
    } else {
      setQuantities([]);
    }
  }, [orderList]);

  // Get the next order number from Firebase for display purposes
  useEffect(() => {
    const getNextOrderNumber = async () => {
      try {
        // Get today's start timestamp (midnight)
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);

        // Query for orders created today only
        const orderQuery = query(
          collection(db, "order_transaction"),
          where("created_at", ">=", startOfDay), // Only get orders from today
          orderBy("created_at", "desc") // Sort by creation time
        );

        const orderSnapshot = await getDocs(orderQuery);

        // If no orders exist for today, start from 1
        if (orderSnapshot.empty) {
          setOrderNumber(1); // First order of the day
        } else {
          // Find the highest order number for today
          let maxOrderNum = 0;
          orderSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.order_id) {
              // Parse the order_id as a number
              const orderNum = parseInt(data.order_id) || 0;
              if (orderNum > maxOrderNum) {
                maxOrderNum = orderNum;
              }
            }
          });

          // Increment for the next order
          setOrderNumber(maxOrderNum + 1);
        }
      } catch (error) {
        console.error("Error getting latest order ID:", error);
        setOrderNumber(1); // Default to 1 if there's an error
      }
    };

    getNextOrderNumber();
  }, []);

  // Decrease quantity
  const decreaseQuantity = (index) => {
    if (orderList) {
      if (quantities[index] > 1) {
        const updatedQuantities = [...quantities];
        updatedQuantities[index] = quantities[index] - 1;
        setQuantities(updatedQuantities);

        // Also update the orderList quantities to keep them in sync
        if (setOrderList) {
          const updatedOrderList = [...orderList];
          updatedOrderList[index] = {
            ...updatedOrderList[index],
            quantity: quantities[index] - 1
          };
          setOrderList(updatedOrderList);
        }
      }
    } else if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Increase quantity
  const increaseQuantity = (index) => {
    if (orderList) {
      const updatedQuantities = [...quantities];
      updatedQuantities[index] = quantities[index] + 1;
      setQuantities(updatedQuantities);

      // Also update the orderList quantities to keep them in sync
      if (setOrderList) {
        const updatedOrderList = [...orderList];
        updatedOrderList[index] = {
          ...updatedOrderList[index],
          quantity: quantities[index] + 1
        };
        setOrderList(updatedOrderList);
      }
    } else {
      setQuantity(quantity + 1);
    }
  };

  // Recalculate total quantity and subtotal dynamically
  useEffect(() => {
    if (orderList && orderList.length > 0 && quantities.length === orderList.length) {
      const totalQty = quantities.reduce((a, b) => a + b, 0); // Sum of all quantities

      const totalSubtotal = orderList.reduce(
        (total, item, index) => {
          const price = parseFloat(item.price);
          return total + price * quantities[index];
        },
        0
      );

      setTotalQuantity(totalQty); // Update total quantity
      setSubtotal(totalSubtotal); // Update subtotal
    } else {
      setTotalQuantity(0);
      setSubtotal(0);
    }
  }, [quantities, orderList]);

  // Function to clear all orders - triggered by the red bin icon
  const clearAllOrders = () => {
    console.log("Clearing all orders...");
    if (setOrderList) {
      setOrderList([]); // Clears the entire order list
      setQuantities([]); // Resets quantities
      setTotalQuantity(0); // Resets total quantity
      setSubtotal(0); // Resets subtotal
    }
  };

  // Function to remove a specific product - triggered by the red "X" icon
  const removeItem = (index) => {
    console.log(`Removing item at index: ${index}`);
    if (orderList && setOrderList) {
      const updatedOrderList = orderList.filter((_, i) => i !== index); // Remove the product at the given index
      const updatedQuantities = quantities.filter((_, i) => i !== index); // Remove the corresponding quantity

      setOrderList(updatedOrderList); // Update the order list
      setQuantities(updatedQuantities); // Update the quantities
    }
  };

  // Save order to Firebase
  const saveOrderToFirebase = async () => {
    try {
      console.log("Saving order to Firebase...");

      // Get all product names for the order name (for table display)
      let orderName = "Unknown Order";
      if (orderList && orderList.length > 0) {
        // Create an array of product names and join them with " / "
        orderName = orderList
          .map(item => item.title)
          .join(" / ");
      }

      // Prepare order items with correct data types and exact format
      const orderItems = orderList.map((item, index) => {
        const price = parseFloat(item.price);
        const qty = quantities[index];
        return {
          category: item.category,
          description: item.description,
          id: item.id,
          price: price,
          quantity: qty,
          title: item.title,
          url: item.url
        };
      });

      // Calculate final total
      const orderTotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Get the highest order_id from existing orders created TODAY
      let nextOrderId = 1; // Default to 1 if no orders exist for today
      try {
        // Get today's start timestamp (midnight)
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);

        // Query for orders created today only
        const orderQuery = query(
          collection(db, "order_transaction"),
          where("created_at", ">=", startOfDay), // Only get orders from today
          orderBy("created_at", "desc") // Sort by creation time
        );

        const orderSnapshot = await getDocs(orderQuery);

        // If no orders exist for today, start from 1
        if (orderSnapshot.empty) {
          nextOrderId = 1; // First order of the day
        } else {
          // Find the highest order number for today
          let maxOrderNum = 0;
          orderSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.order_id) {
              // Parse the order_id as a number
              const orderNum = parseInt(data.order_id) || 0;
              if (orderNum > maxOrderNum) {
                maxOrderNum = orderNum;
              }
            }
          });

          // Increment for the next order
          nextOrderId = maxOrderNum + 1;
        }
      } catch (error) {
        console.error("Error getting latest order ID:", error);
        // Continue with default nextOrderId = 1 if there's an error
      }

      // Convert to string for consistency
      const orderIdString = nextOrderId.toString();

      // Save to "order_transaction" collection with exact format as specified
      const orderTransactionRef = await addDoc(collection(db, "order_transaction"), {
        created_at: serverTimestamp(),
        customer_id: studentId,
        items: orderItems,
        mop: paymentMode,
        no_order: totalQuantity,
        order_date: serverTimestamp(),
        order_name: orderName,
        order_status: "Preparing",
        order_time: timeToday,
        order_total: orderTotal,
        recipient: customerName,
        status: true,
        updated_at: serverTimestamp(),
        order_id: orderIdString // Add the incremental order_id
      });

      console.log("Order saved to order_transaction:", orderTransactionRef.id);

      // Update "customer_history" collection
      const currentMonthYear = dateToday.toLocaleString("default", { month: "long", year: "numeric" });
      const customerHistoryRef = collection(db, "customer_history");

      const customerHistorySnapshot = await addDoc(customerHistoryRef, {
        monthYear: currentMonthYear,
        totalItems: orderItems.reduce((sum, item) => sum + item.quantity, 0),
        totalOrders: 1, // This is one order
        totalSpent: orderTotal,
        customerName: customerName,
        studentId: studentId,
        orderDate: formattedDate,
        orderTime: timeToday,
        customerCount: 1,
        dateSaved: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        orderItems: orderItems,
        order_id: orderIdString // Add the order_id to customer_history as well
      });

      console.log("Order saved to customer_history:", customerHistorySnapshot.id);
      return true;
    } catch (error) {
      console.error("Error saving order to Firebase:", error);
      return false;
    }
  };

  const handleCheckout = () => {
    console.log("Checkout clicked");
    if (orderList && orderList.length > 0) {
      showNameModal(); // Show name input modal first
    } else {
      console.log("Cannot checkout with empty order list");
    }
  };

  const handleCustomerNameChange = (e) => {
    setCustomerName(e.target.value);
    // Clear name error when user types
    if (nameError) setNameError("");
  };

  // Function to check if student ID already exists in the database
  // Returns true if ID exists but with a different name (is a duplicate)
  // Returns false if ID doesn't exist or if ID exists with the same name (allowed)
  const checkDuplicateId = async (id, name) => {
    try {
      const q = query(
        collection(db, "order_transaction"),
        where("customer_id", "==", id)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // ID doesn't exist, so it's not a duplicate
        return false;
      }

      // Check if any document has the same name
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        // If we find a match with the same name, it's not considered a duplicate
        if (data.recipient && data.recipient.trim().toLowerCase() === name.trim().toLowerCase()) {
          return false; // Not a duplicate if same name and ID
        }
      }

      // If we get here, the ID exists but with different names
      return true; // It's a duplicate
    } catch (error) {
      console.error("Error checking for duplicate ID:", error);
      return false; // Assume no duplicate in case of error
    }
  };

  // Validate form inputs
  const validateInputs = async () => {
    let isValid = true;

    // Reset errors
    setNameError("");
    setIdError("");

    // Validate name (required)
    if (!customerName.trim()) {
      setNameError("Customer name is required");
      isValid = false;
    }

    // Validate student ID
    if (!studentId.trim()) {
      setIdError("Student ID is required");
      isValid = false;
    } else if (studentId.length < 6) {
      setIdError("Student ID must be at least 6 digits long");
      isValid = false;
    } else {
      // Check for duplicate ID with different name
      const isDuplicate = await checkDuplicateId(studentId, customerName);
      if (isDuplicate) {
        setIdError("This Student ID already exists with a different name. Please use a different ID.");
        isValid = false;
      }
    }

    return isValid;
  };

  // Modified toggleModal function to reset form state
  const handleModalClose = () => {
    // Reset form state
    setCustomerName("");
    setStudentId("");
    setNameError("");
    setIdError("");
    setIsValidating(false);

    // Close the modal
    toggleModal();
  };

  const handleNameSubmit = async () => {
    setIsValidating(true);

    try {
      const isValid = await validateInputs();

      if (isValid) {
        console.log("Customer Name:", customerName);
        console.log("Student ID:", studentId);
        toggleModal(); // Hide the name modal

        setTimeout(() => {
          showConfirmOrderModal();
        }, 300);
      }
    } catch (error) {
      console.error("Validation error:", error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleConfirmOrder = async () => {
    toggleConfirmOrderModal(); // Hide confirmation modal

    // Save order to Firebase
    const saveResult = await saveOrderToFirebase();

    if (saveResult) {
      // Update the order number display to show the next order number
      const getNextOrderNumber = async () => {
        try {
          // Get today's start timestamp (midnight)
          const today = new Date();
          const startOfDay = new Date(today);
          startOfDay.setHours(0, 0, 0, 0);

          // Query for orders created today only
          const orderQuery = query(
            collection(db, "order_transaction"),
            where("created_at", ">=", startOfDay), // Only get orders from today
            orderBy("created_at", "desc") // Sort by creation time
          );

          const orderSnapshot = await getDocs(orderQuery);

          // If no orders exist for today, start from 1
          if (orderSnapshot.empty) {
            setOrderNumber(1); // First order of the day
          } else {
            // Find the highest order number for today
            let maxOrderNum = 0;
            orderSnapshot.docs.forEach(doc => {
              const data = doc.data();
              if (data.order_id) {
                // Parse the order_id as a number
                const orderNum = parseInt(data.order_id) || 0;
                if (orderNum > maxOrderNum) {
                  maxOrderNum = orderNum;
                }
              }
            });

            // Increment for the next order
            setOrderNumber(maxOrderNum + 1);
          }
        } catch (error) {
          console.error("Error getting latest order ID:", error);
        }
      };

      await getNextOrderNumber();

      setTimeout(() => {
        showSuccessModal();
      }, 300);

      // Reset order lists
      if (setOrderList) {
        setOrderList([]);
        setQuantities([]);
        setTotalQuantity(0);
        setSubtotal(0);
      }
    } else {
      alert("Failed to save order. Please try again.");
    }
  };

  const handleOrderComplete = () => {
    showSuccessModal(); // Toggle off the success modal

    // Reset input fields
    setCustomerName(""); // Clear customer name
    setStudentId(""); // Clear student ID
  };

  // Determine which items to display based on props
  const displayItems = orderList || (product ? [product] : []);

  return (
    <>
      {/* Main Order Section */}
      <div className="bg-white shadow-feat p-4 h-full rounded-tr-xl rounded-br-xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-lato font-semibold text-lg">Order #{orderNumber}:</h3>
          <div className="font-lato text-sm font-semibold space-x-2 flex bg-gray-100 p-1 rounded-md shadow-sm">
            <span className="flex gap-1 items-center">
              <Clock size={16} className="text-gray-700" />
              {timeToday}
            </span>
            <span className="flex gap-1 items-center">
              <Calendar size={16} className="text-gray-700" />
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Payment Mode */}
        <div className="space-y-2 mt-5 mx-3">
          <h4 className="font-lato font-semibold text-base text-gray-800">Mode of Payment:</h4>
          <div className="font-semibold font-lato text-base flex items-center justify-between">
            <div className="space-x-3">
              <button
                className={`border-2 rounded-xl py-1 px-6 cursor-pointer ${
                  paymentMode === "Cash"
                    ? "bg-black text-white border-black"
                    : "border-gray-400 hover:bg-gray-200"
                }`}
                onClick={() => setPaymentMode("Cash")}
              >
                Cash
              </button>
              <button
                className={`border-2 rounded-xl py-1 px-5 cursor-pointer ${
                  paymentMode === "Online"
                    ? "bg-black text-white border-black"
                    : "border-gray-400 hover:bg-gray-200"
                }`}
                onClick={() => setPaymentMode("Online")}
              >
                Online
              </button>
            </div>
            <div
              className="text-red-600 text-xl cursor-pointer hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation();
                clearAllOrders();
              }}
            >
              <MdDelete size={24} />
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="h-[17.3rem] w-full mt-5 flex flex-col space-y-5 overflow-y-auto product-scroll px-3">
          {displayItems.length > 0 ? (
            displayItems.map((item, index) => (
              <div
                key={index}
                className="relative grid grid-cols-[30%_1fr_35%] gap-2 items-center bg-gray-400/5 p-2 rounded-lg"
              >
                <div>
                  <img
                    src={item.url}
                    alt={item.title}
                    className="size-20 rounded-[50%]"
                  />
                </div>
                <div className="flex flex-col justify-start">
                  <span className="font-semibold text-lg">{item.title}</span>
                  <span className="text-sm text-gray-500 font-lato">
                    {item.description}
                  </span>
                  <span className="text-xs font-bold">&#8369; {parseFloat(item.price).toFixed(2)}</span>
                </div>
                <div className="font-lato font-bold text-sm text-center flex flex-col justify-between h-full">
                  <div className="text-sm flex justify-end space-x-1">
                    {orderList && (
                      <>
                        <IoPencil className="text-gray-600" />
                        <MdCancel
                          className="cursor-pointer text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItem(index);
                          }}
                          size={20}
                        />
                      </>
                    )}
                  </div>
                  <div className="space-x-2 flex items-center justify-center">
                    <button
                      onClick={() => decreaseQuantity(index)}
                      className="cursor-pointer text-xl"
                    >
                      -
                    </button>
                    <input
                      type="text"
                      value={quantities[index] || 1}
                      readOnly
                      className="border-[0.5px] border-gray-500 w-[50%] text-center rounded-xl"
                    />
                    <button
                      onClick={() => increaseQuantity(index)}
                      className="cursor-pointer text-xl"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 my-8">
              No items in the order list.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="grid grid-rows-2 bg-gray-200 h-auto -mx-4 py-3 pl-5 pr-7 gap-3 mt-3 rounded-t-lg shadow-inner">
          <div className="flex justify-between items-center">
            <span className="font-bold font-lato text-base text-gray-800">
              Number of Products:
            </span>
            <span className="font-medium font-lato text-base">
              {totalQuantity}x
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold font-lato text-base text-gray-800">Subtotal:</span>
            <span className="font-medium font-lato text-base">
              &#8369; {subtotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Checkout Button */}
        <div className="h-[3.3rem] items-center flex justify-end mt-4">
          <button
            className={`text-sm font-lato font-bold rounded-3xl border-[0.5px] py-2 px-6 ${
              displayItems.length > 0
                ? "bg-[#0cd742] text-white cursor-pointer hover:bg-[#0ab538] shadow-md"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={handleCheckout}
            disabled={displayItems.length === 0}
          >
            Checkout
          </button>
        </div>
      </div>

      {/* Enter Name Modal */}
      {inputNameModal && (
        <AnimatePresence>
          <motion.div
            className="h-screen w-screen bg-black/25 flex justify-center items-center fixed top-0 left-0 bottom-0 right-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleModalClose}
          >
            <motion.div
              className="bg-white w-[18rem] min-h-[20rem] pb-3 rounded-xl font-lato"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full rounded-t-xl flex items-center justify-between bg-[#0cd742] text-white py-2 px-3">
                <div className="flex items-center text-center justify-center space-x-1.5">
                  <span className="font-semibold text-sm pt-1">Confirm Order</span>
                </div>
                <div>
                  <MdCancel className="cursor-pointer" onClick={handleModalClose} />
                </div>
              </div>
              <div className="w-auto h-auto justify-center flex flex-col items-center pt-5">
                <div className="space-y-3 px-4">
                  {/* Customer Name Field */}
                  <span className="text-sm">Please enter the customer's name:</span>
                  <div>
                    <div className="relative w-full">
                      <input
                        type="text"
                        placeholder="e.g. Juan Dela Cruz"
                        className={`font-lato border-[1px] ${nameError ? 'border-red-500' : 'border-gray-500'} pl-4 pr-8 pt-2 pb-2 rounded-2xl text-base placeholder:text-base w-full bg-gray-300 shadow`}
                        value={customerName}
                        onChange={handleCustomerNameChange}
                      />
                      <div className="h-5 mt-1">
                        {nameError && (
                          <div className="text-red-500 text-xs flex items-center">
                            <FiAlertCircle className="mr-1" />
                            {nameError}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Student ID Field */}
                  <span className="text-sm">Please enter the student's ID:</span>
                  <div>
                    <div className="relative w-full">
                      <input
                        type="text"
                        placeholder="e.g., 232xxx"
                        className={`font-lato border-[1px] ${idError ? 'border-red-500' : 'border-gray-500'} pl-4 pr-8 pt-2 pb-2 rounded-2xl text-base placeholder:text-base w-full bg-gray-300 shadow`}
                        value={studentId}
                        onChange={(e) => {
                          setStudentId(e.target.value);
                          if (idError) setIdError("");
                        }}
                      />
                      <div className="h-5 mt-1">
                        {idError && (
                          <div className="text-red-500 text-xs flex items-center">
                            <FiAlertCircle className="mr-1" />
                            {idError}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Next Button */}
                  <div className="w-full flex items-center justify-center mx-a mt-2">
                    <button
                      className={`${isValidating ? 'bg-gray-400' : 'bg-[#0cd742]'} text-white text-center py-1.5 px-8.5 rounded-2xl text-[0.77rem] cursor-pointer hover:bg-black/70`}
                      onClick={handleNameSubmit}
                      disabled={isValidating}
                    >
                      {isValidating ? 'Validating...' : 'Next'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Confirm Order Modal */}
      {confirmOrderModal && (
        <AnimatePresence>
          <motion.div
            className="h-screen w-screen bg-black/25 flex justify-center items-center fixed top-0 left-0 bottom-0 right-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white w-[25rem] h-auto pb-5 rounded-3xl font-lato"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-full rounded-t-3xl flex items-center justify-between bg-[#0cd742] text-white py-2 px-3">
                <div className="flex items-center text-center justify-center space-x-1.5">
                  <span className="font-semibold text-sm pt-1">CONFIRM ORDER</span>
                </div>
                <div>
                  <MdCancel className="cursor-pointer" onClick={toggleConfirmOrderModal} />
                </div>
              </div>
              <div className="p-4">
                <div className="mb-2">
                  <div className="flex justify-between">
                    <span className="font-bold text-sm">Order ID:</span>
                    <span className="text-sm font-medium">{orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-sm">Payment Method:</span>
                    <span className="text-sm">{paymentMode}</span>
                  </div>
                </div>

                {/* Order Items List */}
                <div className="max-h-40 overflow-y-auto mb-4">
                  {displayItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center mb-2 text-sm">
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-gray-500">
                          Quantity: {quantities[index] || 1}
                        </div>
                      </div>
                      <div className="text-right">
                        <div>₱{parseFloat(item.price).toFixed(2)}</div>
                        <div className="text-xs">
                          x{quantities[index] || 1}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Total */}
                <div className="border-t pt-2 mb-4">
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>
                      ₱{subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Date and Time */}
                <div className="border-t pt-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span>{timeToday}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                  <button
                    className="bg-[#0cd742] text-white text-center py-1 px-8 rounded-2xl text-sm cursor-pointer hover:bg-black/70"
                    onClick={handleConfirmOrder}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Success Modal */}
      {okayModal && (
        <AnimatePresence>
          <motion.div
            className="h-screen w-screen bg-black/25 flex justify-center items-center fixed top-0 left-0 bottom-0 right-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white w-[17rem] h-auto pb-5 rounded-4xl font-lato"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-full rounded-t-4xl flex items-center flex-col text-black pt-4 px-3">
                <div className="flex items-center flex-col text-center space-x-1.5">
                  <FaCheckCircle className="size-12 text-[#0cd742]" />
                  <span className="font-bold text-2xl pt-1 mt-1">
                    Order Completed
                  </span>
                  <div>
                    <div className="w-auto h-auto justify-center flex flex-col items-center mt-2">
                      <div className="space-y-2 w-[80%]">
                        <span className="text-[.9rem]">
                          Congrats! You have ordered successfully
                        </span>
                        <div className="text-[.9rem] font-semibold mt-2">
                          Order ID: {orderNumber - 1}
                        </div>
                      </div>
                      <button
                        className="bg-[#0cd742] text-white text-center py-1 mt-3 px-8.5 rounded-2xl text-[0.77rem] cursor-pointer hover:bg-black/70"
                        type="submit"
                        onClick={handleOrderComplete}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
};

export default DashboardOrder;