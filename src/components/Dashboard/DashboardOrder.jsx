import React, { useState, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";
import { MdCancel, MdDelete } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
import { IoPencil } from "react-icons/io5";
import useNameModal from "../../hooks/Modal/EnterNameModal";
import useConfirmOrderModal from "../../hooks/Modal/ConfirmOrderModal";
import useSuccessModal from "../../hooks/Modal/SuccessModal";
import { AnimatePresence, motion } from "framer-motion";

const DashboardOrder = ({ product, orderList, setOrderList }) => {
  const [orderNumber, setOrderNumber] = useState(1);
  const [quantities, setQuantities] = useState([]);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [studentId, setStudentId] = useState("");

  // Import custom hooks
  const { inputNameModal, showNameModal, toggleModal } = useNameModal();
  const { confirmOrderModal, showConfirmOrderModal, toggleConfirmOrderModal } = useConfirmOrderModal();
  const { okayModal, showSuccessModal } = useSuccessModal();

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

  // Initialize quantities based on the orderList length
  useEffect(() => {
    setQuantities(orderList ? orderList.map(() => 1) : [1]); // Initialize quantities to 1 for each product
  }, [orderList]);

  // Decrease quantity
  const decreaseQuantity = (index) => {
    if (orderList) {
      setQuantities((prev) =>
        prev.map((qty, i) => (i === index && qty > 1 ? qty - 1 : qty))
      );
    } else if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Increase quantity
  const increaseQuantity = (index) => {
    if (orderList) {
      setQuantities((prev) => prev.map((qty, i) => (i === index ? qty + 1 : qty)));
    } else {
      setQuantity(quantity + 1);
    }
  };

  // For backward compatibility with old implementation
  const [quantity, setQuantity] = useState(1);

  // Recalculate total quantity and subtotal dynamically
  useEffect(() => {
    if (orderList && orderList.length > 0) {
      const totalQty = quantities.reduce((a, b) => a + b, 0); // Sum of all quantities
      const totalSubtotal = orderList.reduce(
        (total, item, index) => total + item.price * quantities[index],
        0
      );

      setTotalQuantity(totalQty); // Update total quantity
      setSubtotal(totalSubtotal); // Update subtotal
    }
  }, [quantities, orderList]);

  // Function to clear all orders - triggered by the red bin icon
  const clearAllOrders = () => {
    console.log("Clearing all orders..."); // Debugging
    if (setOrderList) {
      setOrderList([]); // Clears the entire order list
      setQuantities([]); // Resets quantities
      setTotalQuantity(0); // Resets total quantity
      setSubtotal(0); // Resets subtotal
    }
  };

  // Function to remove a specific product - triggered by the red "X" icon
  const removeItem = (index) => {
    console.log(`Removing item at index: ${index}`); // Debugging
    if (orderList && setOrderList) {
      const updatedOrderList = orderList.filter((_, i) => i !== index); // Remove the product at the given index
      const updatedQuantities = quantities.filter((_, i) => i !== index); // Remove the corresponding quantity

      setOrderList(updatedOrderList); // Update the order list
      setQuantities(updatedQuantities); // Update the quantities

      // Recalculate total quantity and subtotal
      const totalQty = updatedQuantities.reduce((a, b) => a + b, 0);
      const totalSubtotal = updatedOrderList.reduce(
        (total, item, i) => total + item.price * updatedQuantities[i],
        0
      );

      setTotalQuantity(totalQty); // Update total quantity
      setSubtotal(totalSubtotal); // Update subtotal
    }
  };

  const handleCheckout = () => {
    console.log("Checkout clicked");
    showNameModal(); // Show name input modal first
  };
  
  const handleCustomerNameChange = (e) => {
    setCustomerName(e.target.value);
  };

  const handleNameSubmit = () => {
    console.log("Customer Name:", customerName);
    console.log("Student ID:", studentId);
    toggleModal(); // Hide the name modal

    setTimeout(() => {
      showConfirmOrderModal();
    }, 300);
  };

  const handleConfirmOrder = () => {
    toggleConfirmOrderModal(); // Hide confirmation modal

    setTimeout(() => {
      showSuccessModal();
    }, 300);
    
    // Reset order lists
    if (setOrderList) {
      setOrderList([]);
      setQuantities([]);
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
          <h3 className="font-lato font-semibold text-lg">Order {orderNumber}:</h3>
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
                  <span className="text-xs font-bold">&#8369; {item.price}</span>
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
                      value={orderList ? quantities[index] : quantity}
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
              {orderList ? totalQuantity : quantity}x
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold font-lato text-base text-gray-800">Subtotal:</span>
            <span className="font-medium font-lato text-base">
              &#8369; {orderList ? subtotal.toFixed(2) : (product ? product.price * quantity : 0).toFixed(2)}
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
          >
            <motion.div
              className="bg-white w-[18rem] h-auto pb-3 rounded-xl font-lato"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-full rounded-t-xl flex items-center justify-between bg-[#0cd742] text-white py-2 px-3">
                <div className="flex items-center text-center justify-center space-x-1.5">
                  <span className="font-semibold text-sm pt-1">Confirm Order</span>
                </div>
                <div>
                  <MdCancel className="cursor-pointer" onClick={toggleModal} />
                </div>
              </div>
              <div className="w-auto h-auto justify-center flex flex-col items-center pt-5">
                <div className="space-y-2">
                  {/* Customer Name Field */}
                  <span className="text-sm">Please enter the customer's name:</span>
                  <div>
                    <div className="relative w-full">
                      <input
                        type="text"
                        placeholder="e.g. Juan Dela Cruz"
                        className="font-lato border-[1px] border-gray-500 pl-4 pr-8 pt-2 pb-2 rounded-2xl text-base placeholder:text-base w-full bg-gray-300 shadow"
                        value={customerName}
                        onChange={handleCustomerNameChange}
                      />
                    </div>
                  </div>

                  {/* Student ID Field */}
                  <span className="text-sm">Please enter the student's ID:</span>
                  <div>
                    <div className="relative w-full">
                      <input
                        type="text"
                        placeholder="e.g., 232xxx"
                        className="font-lato border-[1px] border-gray-500 pl-4 pr-8 pt-2 pb-2 rounded-2xl text-base placeholder:text-base w-full bg-gray-300 shadow"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Next Button */}
                  <div className="w-full flex items-center justify-center mx-a">
                    <button
                      className="bg-[#0cd742] text-white text-center py-1 mt-1 px-8.5 rounded-2xl text-[0.77rem] cursor-pointer hover:bg-black/70"
                      onClick={handleNameSubmit}
                    >
                      Next
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
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-sm">Order #{Math.floor(Math.random() * 90000) + 10000}</span>
                  <span className="text-sm">{paymentMode} Payment</span>
                </div>
                
                {/* Order Items List */}
                <div className="max-h-40 overflow-y-auto mb-4">
                  {displayItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center mb-2 text-sm">
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-gray-500">
                          Quantity: {orderList ? quantities[index] : quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div>₱{item.price}</div>
                        <div className="text-xs">
                          x{orderList ? quantities[index] : quantity}
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
                      ₱{orderList 
                         ? subtotal.toFixed(2) 
                         : (product ? product.price * quantity : 0).toFixed(2)}
                    </span>
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